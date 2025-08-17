import ResultsTableHeader from './ResultsTableHeader.tsx';
import ResultsTableBody from './ResultsTableBody.tsx';

interface ResultsTableProps {
    results: any[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
    if (!results || results.length === 0) {
        return null;
    }

    const columns = Object.keys(results[0]);

    return (
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-700">
                <ResultsTableHeader columns={columns} />
                <ResultsTableBody data={results} columns={columns} />
            </table>
        </div>
    );
}