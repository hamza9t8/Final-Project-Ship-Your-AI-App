interface MatrixGridProps {
  sizes: string[];
  colors: string[];
  values: Record<string, Record<string, number>>;
  onChange: (color: string, size: string, value: number) => void;
}

export function MatrixGrid({ sizes, colors, values, onChange }: MatrixGridProps) {
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-gray-400 font-medium whitespace-nowrap">Color \ Size</th>
            {sizes.map(size => (
              <th key={size} className="p-2 font-semibold min-w-[60px]">{size}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colors.map(color => (
            <tr key={color} className="border-t border-gray-800">
              <td className="p-3 text-left font-medium whitespace-nowrap">{color}</td>
              {sizes.map(size => {
                const val = values[color]?.[size] || 0;
                return (
                  <td key={size} className="p-1">
                    <input
                      type="number"
                      min="0"
                      value={val === 0 ? '' : val}
                      onChange={(e) => onChange(color, size, parseInt(e.target.value) || 0)}
                      className="w-14 h-12 bg-primary border border-gray-700 rounded-lg text-center text-lg font-semibold focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green"
                      placeholder="0"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
