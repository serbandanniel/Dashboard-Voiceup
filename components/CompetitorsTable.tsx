import React from 'react';

const CompetitorsTable: React.FC = () => {
  // Lista actualizata pentru a reflecta totalul corect de 8.200 RON
  const competitors = [
    { nr: 1, name: "ABĂLARU Sofia", pieces: 1, price: 300 },
    { nr: 2, name: "BEJENARU Antonia-Bianca", pieces: 2, price: 500 },
    { nr: 3, name: "CÂLȚEA Daria Rebeca", pieces: 2, price: 500 },
    { nr: 4, name: "CHIVU Cristina", pieces: 1, price: 300 },
    { nr: 5, name: "CIOCIANU Eva Natalia", pieces: 1, price: 300 },
    { nr: 6, name: "CODOREAN Iris Ioana", pieces: 1, price: 300 },
    { nr: 7, name: "COJOCARU Eric Marian", pieces: 1, price: 300 },
    { nr: 8, name: "GHEORGIULESCU Mara Iulia", pieces: 2, price: 500 },
    { nr: 9, name: "IONIȚĂ Sofia Maria", pieces: 1, price: 300 },
    { nr: 10, name: "LIXANDRU Alexandra", pieces: 1, price: 300 },
    { nr: 11, name: "MARIN Cristina Maria", pieces: 2, price: 500 },
    { nr: 12, name: "MATYAS Enyco Mihaela", pieces: 1, price: 300 },
    { nr: 13, name: "MIHĂILOIU Maya Andreea", pieces: 2, price: 500 },
    { nr: 14, name: "MONAC Iris Amelie", pieces: 2, price: 500 },
    { nr: 15, name: "NICULAE Casey Anastasia", pieces: 1, price: 300 },
    { nr: 16, name: "NIȚU Iustin", pieces: 1, price: 300 },
    { nr: 17, name: "PREDA Ingrid Maria", pieces: 1, price: 300 },
    { nr: 18, name: "RADU Cataleya Andreea", pieces: 1, price: 300 },
    { nr: 19, name: "SWEET DUO", pieces: "1 (Grup)", price: 400 },
    { nr: 20, name: "VÎRGĂ Ingrid-Sofia", pieces: 1, price: 300 },
    { nr: 21, name: "VLAD David - Andrei", pieces: 1, price: 300 },
    { nr: 22, name: "YILDIRIM Emine", pieces: 1, price: 300 },
    { nr: 23, name: "Înscriere Suplimentară / Tardivă", pieces: 1, price: 300 },
  ];

  const total = competitors.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
      <div className="p-5 flex items-center border-l-8 border-[#0e1b38] bg-white border-b border-gray-100">
        <h2 className="text-xl font-extrabold text-[#0e1b38] uppercase flex items-center gap-2">
            <i className="fas fa-users"></i> Centralizator Concurenți
        </h2>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm text-left">
            <thead className="bg-[#0e1b38] text-white text-xs uppercase font-bold">
                <tr>
                    <th className="px-4 py-3 text-center w-[60px]">Nr.</th>
                    <th className="px-4 py-3">Nume Concurent</th>
                    <th className="px-4 py-3 text-center">Nr. Piese</th>
                    <th className="px-4 py-3 text-right">Total de Plată</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {competitors.map((c) => (
                    <tr key={c.nr} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-center font-bold text-[#ff2e63]">{c.nr}</td>
                        <td className="px-4 py-3 font-bold text-[#0e1b38]">{c.name}</td>
                        <td className="px-4 py-3 text-center">{c.pieces}</td>
                        <td className="px-4 py-3 text-right font-bold text-[#27ae60]">{c.price} RON</td>
                    </tr>
                ))}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={3} className="px-4 py-4 text-right font-bold text-gray-700">SUBTOTAL ÎNCASĂRI CONCURENȚI:</td>
                    <td className="px-4 py-4 text-right font-extrabold text-[#0e1b38] text-lg">{total.toLocaleString('ro-RO')} RON</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompetitorsTable;