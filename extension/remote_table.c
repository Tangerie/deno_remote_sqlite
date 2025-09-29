// remote_table.c - Simplified SQLite Extension for Remote Virtual Tables
#include "sqlite3ext.h"
SQLITE_EXTENSION_INIT1

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <curl/curl.h>
#include "cJSON.h"

/* Virtual table structure */
typedef struct remote_table {
  sqlite3_vtab base;
  char *remote_url;
  char *query;
  cJSON *cached_data;
  cJSON *columns;
  int row_count;
} remote_table;

/* Cursor structure */
typedef struct remote_cursor {
  sqlite3_vtab_cursor base;
  int row_index;
  cJSON *current_row;
} remote_cursor;

/* Memory buffer for CURL response */
struct MemoryStruct {
  char *memory;
  size_t size;
};

/* CURL write callback */
static size_t WriteMemoryCallback(void *contents, size_t size, size_t nmemb, void *userp) {
  size_t realsize = size * nmemb;
  struct MemoryStruct *mem = (struct MemoryStruct *)userp;
  
  char *ptr = realloc(mem->memory, mem->size + realsize + 1);
  if(!ptr) return 0;
  
  mem->memory = ptr;
  memcpy(&(mem->memory[mem->size]), contents, realsize);
  mem->size += realsize;
  mem->memory[mem->size] = 0;
  
  return realsize;
}

/* Fetch data from remote server using POST */
static cJSON* fetch_remote_data(const char *url, const char *query, char **error_msg) {
  CURL *curl;
  CURLcode res;
  struct MemoryStruct chunk;
  cJSON *json = NULL;
  long http_code = 0;
  
  chunk.memory = malloc(1);
  chunk.size = 0;
  chunk.memory[0] = '\0';
  
  curl_global_init(CURL_GLOBAL_ALL);
  curl = curl_easy_init();
  
  if(!curl) {
    if(error_msg) *error_msg = sqlite3_mprintf("Failed to initialize CURL");
    free(chunk.memory);
    return NULL;
  }
  
  struct curl_slist *headers = NULL;
  headers = curl_slist_append(headers, "Content-Type: text/plain");
  headers = curl_slist_append(headers, "Accept: application/json");
  
  curl_easy_setopt(curl, CURLOPT_URL, url);
  curl_easy_setopt(curl, CURLOPT_POST, 1L);
  curl_easy_setopt(curl, CURLOPT_POSTFIELDS, query);
  curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, strlen(query));
  curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
  curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteMemoryCallback);
  curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&chunk);
  curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
  curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 10L);
  
  res = curl_easy_perform(curl);
  curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
  
  curl_slist_free_all(headers);
  curl_easy_cleanup(curl);
  curl_global_cleanup();
  
  if(res == CURLE_OK && http_code == 200) {
    json = cJSON_Parse(chunk.memory);
    if(!json) {
      if(error_msg) *error_msg = sqlite3_mprintf("Invalid JSON response from server");
    } else if(!cJSON_IsArray(json)) {
      // Check for error response
      cJSON *error = cJSON_GetObjectItem(json, "error");
      if(error) {
        if(error_msg) *error_msg = sqlite3_mprintf("Server error: %s", 
          cJSON_GetStringValue(error));
        cJSON_Delete(json);
        json = NULL;
      }
    }
  } else if(res != CURLE_OK) {
    if(error_msg) *error_msg = sqlite3_mprintf("CURL error: %s", curl_easy_strerror(res));
  } else {
    if(error_msg) *error_msg = sqlite3_mprintf("HTTP error code: %ld", http_code);
  }
  
  free(chunk.memory);
  return json;
}

/* Extract column names from first row */
static cJSON* extract_columns(cJSON *data) {
  cJSON *columns = cJSON_CreateArray();
  if(!data || !cJSON_IsArray(data) || cJSON_GetArraySize(data) == 0) {
    return columns;
  }
  
  cJSON *first_row = cJSON_GetArrayItem(data, 0);
  if(!first_row || !cJSON_IsObject(first_row)) return columns;
  
  cJSON *field = NULL;
  cJSON_ArrayForEach(field, first_row) {
    if(field->string) {
      // Sanitize column names for SQLite
      char *clean_name = sqlite3_mprintf("%s", field->string);
      for(char *p = clean_name; *p; p++) {
        if(!isalnum(*p) && *p != '_') *p = '_';
      }
      cJSON_AddItemToArray(columns, cJSON_CreateString(clean_name));
      sqlite3_free(clean_name);
    }
  }
  
  return columns;
}

/* xCreate/xConnect - Create virtual table */
static int remoteConnect(
  sqlite3 *db,
  void *pAux,
  int argc, const char *const*argv,
  sqlite3_vtab **ppVtab,
  char **pzErr
){
  remote_table *pNew;
  char *error_msg = NULL;
  int rc;
  
  // Require: CREATE VIRTUAL TABLE name USING remote_table(url, query)
  if(argc != 5) {
    *pzErr = sqlite3_mprintf("remote_table requires exactly 2 arguments: URL and SQL query");
    return SQLITE_ERROR;
  }
  
  pNew = sqlite3_malloc(sizeof(*pNew));
  if(!pNew) return SQLITE_NOMEM;
  memset(pNew, 0, sizeof(*pNew));
  
  // Store URL and query
  pNew->remote_url = sqlite3_mprintf("%s", argv[3]);
  pNew->query = sqlite3_mprintf("%s", argv[4]);
  
  // Fetch data from remote server
  pNew->cached_data = fetch_remote_data(pNew->remote_url, pNew->query, &error_msg);
  if(!pNew->cached_data) {
    sqlite3_free(pNew->remote_url);
    sqlite3_free(pNew->query);
    sqlite3_free(pNew);
    *pzErr = error_msg ? error_msg : sqlite3_mprintf("Failed to fetch data from remote server");
    return SQLITE_ERROR;
  }
  
  // Extract column information
  pNew->columns = extract_columns(pNew->cached_data);
  pNew->row_count = cJSON_GetArraySize(pNew->cached_data);
  
  // Declare the virtual table schema
  sqlite3_str *str = sqlite3_str_new(db);
  sqlite3_str_appendf(str, "CREATE TABLE x(");
  
  int col_count = cJSON_GetArraySize(pNew->columns);
  if(col_count > 0) {
    for(int i = 0; i < col_count; i++) {
      cJSON *col = cJSON_GetArrayItem(pNew->columns, i);
      if(i > 0) sqlite3_str_appendf(str, ", ");
      sqlite3_str_appendf(str, "%s", cJSON_GetStringValue(col));
    }
  } else {
    // Fallback if no columns detected
    sqlite3_str_appendf(str, "data");
  }
  sqlite3_str_appendf(str, ")");
  
  char *zSql = sqlite3_str_finish(str);
  rc = sqlite3_declare_vtab(db, zSql);
  sqlite3_free(zSql);
  
  if(rc != SQLITE_OK) {
    cJSON_Delete(pNew->cached_data);
    cJSON_Delete(pNew->columns);
    sqlite3_free(pNew->remote_url);
    sqlite3_free(pNew->query);
    sqlite3_free(pNew);
    return rc;
  }
  
  *ppVtab = &pNew->base;
  return SQLITE_OK;
}

/* xDisconnect/xDestroy - Destroy virtual table */
static int remoteDisconnect(sqlite3_vtab *pVtab) {
  remote_table *p = (remote_table*)pVtab;
  cJSON_Delete(p->cached_data);
  cJSON_Delete(p->columns);
  sqlite3_free(p->remote_url);
  sqlite3_free(p->query);
  sqlite3_free(p);
  return SQLITE_OK;
}

/* xOpen - Open a cursor */
static int remoteOpen(sqlite3_vtab *p, sqlite3_vtab_cursor **ppCursor) {
  remote_cursor *pCur;
  pCur = sqlite3_malloc(sizeof(*pCur));
  if(!pCur) return SQLITE_NOMEM;
  memset(pCur, 0, sizeof(*pCur));
  *ppCursor = &pCur->base;
  return SQLITE_OK;
}

/* xClose - Close cursor */
static int remoteClose(sqlite3_vtab_cursor *cur) {
  sqlite3_free(cur);
  return SQLITE_OK;
}

/* xFilter - Begin a search */
static int remoteFilter(
  sqlite3_vtab_cursor *pVtabCursor,
  int idxNum, const char *idxStr,
  int argc, sqlite3_value **argv
){
  remote_cursor *pCur = (remote_cursor*)pVtabCursor;
  remote_table *pTab = (remote_table*)pVtabCursor->pVtab;
  
  // Start at the first row
  pCur->row_index = 0;
  pCur->current_row = cJSON_GetArrayItem(pTab->cached_data, 0);
  
  return SQLITE_OK;
}

/* xNext - Advance cursor to next row */
static int remoteNext(sqlite3_vtab_cursor *pVtabCursor) {
  remote_cursor *pCur = (remote_cursor*)pVtabCursor;
  remote_table *pTab = (remote_table*)pVtabCursor->pVtab;
  
  pCur->row_index++;
  pCur->current_row = cJSON_GetArrayItem(pTab->cached_data, pCur->row_index);
  
  return SQLITE_OK;
}

/* xEof - Check if at end of results */
static int remoteEof(sqlite3_vtab_cursor *pVtabCursor) {
  remote_cursor *pCur = (remote_cursor*)pVtabCursor;
  return pCur->current_row == NULL;
}

/* xColumn - Return value of a column */
static int remoteColumn(
  sqlite3_vtab_cursor *pVtabCursor,
  sqlite3_context *ctx,
  int i
){
  remote_cursor *pCur = (remote_cursor*)pVtabCursor;
  remote_table *pTab = (remote_table*)pVtabCursor->pVtab;
  
  if(!pCur->current_row || !cJSON_IsObject(pCur->current_row)) {
    sqlite3_result_null(ctx);
    return SQLITE_OK;
  }
  
  // Get the column name
  cJSON *col_name = cJSON_GetArrayItem(pTab->columns, i);
  if(!col_name) {
    sqlite3_result_null(ctx);
    return SQLITE_OK;
  }
  
  // We need to map back to the original field name (before sanitization)
  // Get the first row to find original field names
  cJSON *first_row = cJSON_GetArrayItem(pTab->cached_data, 0);
  if(!first_row) {
    sqlite3_result_null(ctx);
    return SQLITE_OK;
  }
  
  // Find the original field name by position
  int col_idx = 0;
  cJSON *field = NULL;
  char *original_name = NULL;
  
  cJSON_ArrayForEach(field, first_row) {
    if(col_idx == i && field->string) {
      original_name = field->string;
      break;
    }
    col_idx++;
  }
  
  if(!original_name) {
    sqlite3_result_null(ctx);
    return SQLITE_OK;
  }
  
  // Get the value from the current row
  cJSON *value = cJSON_GetObjectItem(pCur->current_row, original_name);
  if(!value) {
    sqlite3_result_null(ctx);
    return SQLITE_OK;
  }
  
  // Return the value with appropriate type
  if(cJSON_IsString(value)) {
    sqlite3_result_text(ctx, cJSON_GetStringValue(value), -1, SQLITE_TRANSIENT);
  } else if(cJSON_IsNumber(value)) {
    // Check if it's an integer or float
    double d = cJSON_GetNumberValue(value);
    if(d == (double)(sqlite3_int64)d) {
      sqlite3_result_int64(ctx, (sqlite3_int64)d);
    } else {
      sqlite3_result_double(ctx, d);
    }
  } else if(cJSON_IsBool(value)) {
    sqlite3_result_int(ctx, cJSON_IsTrue(value) ? 1 : 0);
  } else if(cJSON_IsNull(value)) {
    sqlite3_result_null(ctx);
  } else {
    // For complex types (arrays, objects), return as JSON string
    char *json_str = cJSON_PrintUnformatted(value);
    if(json_str) {
      sqlite3_result_text(ctx, json_str, -1, sqlite3_free);
    } else {
      sqlite3_result_null(ctx);
    }
  }
  
  return SQLITE_OK;
}

/* xRowid - Return current row ID */
static int remoteRowid(sqlite3_vtab_cursor *pVtabCursor, sqlite_int64 *pRowid) {
  remote_cursor *pCur = (remote_cursor*)pVtabCursor;
  *pRowid = pCur->row_index;
  return SQLITE_OK;
}

/* xBestIndex - Help query planner understand costs */
static int remoteBestIndex(sqlite3_vtab *tab, sqlite3_index_info *pIdxInfo) {
  remote_table *pTab = (remote_table*)tab;
  
  // Provide estimated costs for query planning
  pIdxInfo->estimatedCost = 1000.0;
  pIdxInfo->estimatedRows = pTab->row_count;
  
  // We don't optimize WHERE clauses - SQLite will filter for us
  return SQLITE_OK;
}

/* Module definition - vtable method table */
static sqlite3_module remoteModule = {
  0,                    /* iVersion */
  remoteConnect,        /* xCreate */
  remoteConnect,        /* xConnect */
  remoteBestIndex,      /* xBestIndex */
  remoteDisconnect,     /* xDisconnect */
  remoteDisconnect,     /* xDestroy */
  remoteOpen,           /* xOpen */
  remoteClose,          /* xClose */
  remoteFilter,         /* xFilter */
  remoteNext,           /* xNext */
  remoteEof,            /* xEof */
  remoteColumn,         /* xColumn */
  remoteRowid,          /* xRowid */
  0,                    /* xUpdate - NULL for read-only */
  0,                    /* xBegin */
  0,                    /* xSync */
  0,                    /* xCommit */
  0,                    /* xRollback */
  0,                    /* xFindFunction */
  0,                    /* xRename */
  0,                    /* xSavepoint */
  0,                    /* xRelease */
  0,                    /* xRollbackTo */
  0                     /* xShadowName */
};

/* Extension entry point */
#ifdef _WIN32
__declspec(dllexport)
#endif
int sqlite3_remotetable_init(
  sqlite3 *db,
  char **pzErrMsg,
  const sqlite3_api_routines *pApi
){
  int rc = SQLITE_OK;
  SQLITE_EXTENSION_INIT2(pApi);
  
  // Register the virtual table module
  rc = sqlite3_create_module(db, "remote_table", &remoteModule, 0);
  
  return rc;
}