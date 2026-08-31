import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { useEffect, useMemo, useRef, useState } from 'react';

const BATCH_SIZE = 20;

export default function PrerequisiteChecklist({ options, selectedIds, onToggle, error }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const scrollRef = useRef(null);
    const sentinelRef = useRef(null);

    const sortedOptions = useMemo(() => {
        return [...(options ?? [])].sort((a, b) => a.title.localeCompare(b.title));
    }, [options]);

    const filteredOptions = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        if (!normalized) return sortedOptions;
        return sortedOptions.filter((option) => option.title.toLowerCase().includes(normalized));
    }, [sortedOptions, searchTerm]);

    useEffect(() => {
        setVisibleCount(BATCH_SIZE);
    }, [searchTerm]);

    useEffect(() => {
        const root = scrollRef.current;
        const sentinel = sentinelRef.current;
        if (!root || !sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((count) => Math.min(count + BATCH_SIZE, filteredOptions.length));
                }
            },
            { root, threshold: 0.1 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [filteredOptions.length]);

    const visibleOptions = filteredOptions.slice(0, visibleCount);

    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <InputLabel value="Pre-requisites" />
                {selectedIds.length > 0 && (
                    <span className="text-xs font-medium text-indigo-600">{selectedIds.length} selected</span>
                )}
            </div>

            <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search course profiles..."
                className="mb-2 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />

            <div ref={scrollRef} className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {visibleOptions.length > 0 ? (
                    <>
                        {visibleOptions.map((option) => {
                            const isSelected = selectedIds.includes(Number(option.id));

                            return (
                                <label
                                    key={option.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2 transition ${
                                        isSelected
                                            ? 'border-indigo-200 bg-indigo-100 text-indigo-900'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onToggle(option.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium">{option.title}</span>
                                </label>
                            );
                        })}
                        {visibleCount < filteredOptions.length && (
                            <div ref={sentinelRef} className="py-2 text-center text-xs text-gray-400">
                                Loading more...
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-500">
                        {searchTerm ? 'No course profiles match your search.' : 'No course profiles available yet.'}
                    </p>
                )}
            </div>

            <InputError message={error} className="mt-3" />
        </div>
    );
}
