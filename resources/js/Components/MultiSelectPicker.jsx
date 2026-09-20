import TextInput from '@/Components/TextInput';
import { useEffect, useRef, useState } from 'react';

export default function MultiSelectPicker({
    options = [],
    value = [],
    onChange,
    knownItems = [],
    placeholder = 'Search by name',
    emptyMessage = 'No options available.',
}) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const normalized = search.trim().toLowerCase();
    const results = options.filter(
        (option) =>
            !value.includes(option.id) &&
            (normalized.length === 0 || option.name.toLowerCase().includes(normalized)),
    );

    const selectedItems = value.map(
        (id) => [...options, ...knownItems].find((item) => item.id === id) ?? { id, name: `#${id}` },
    );

    const add = (option) => {
        onChange([...value, option.id]);
        setSearch('');
    };

    const remove = (id) => onChange(value.filter((selectedId) => selectedId !== id));

    return (
        <div>
            <div className="relative" ref={containerRef}>
                <TextInput
                    className="block w-full"
                    placeholder={placeholder}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onFocus={() => setOpen(true)}
                />
                {open && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                        {results.length > 0 ? (
                            results.map((option) => (
                                <button
                                    type="button"
                                    key={option.id}
                                    onClick={() => add(option)}
                                    className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    {option.name}
                                </button>
                            ))
                        ) : (
                            <p className="px-3 py-2 text-sm text-gray-500">
                                {options.length === 0 ? emptyMessage : 'No matches.'}
                            </p>
                        )}
                    </div>
                )}
            </div>
            {selectedItems.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {selectedItems.map((item) => (
                        <span key={item.id} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-3 pr-2 text-xs text-gray-700">
                            {item.name}
                            <button type="button" onClick={() => remove(item.id)} className="text-gray-400 hover:text-gray-600">
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
