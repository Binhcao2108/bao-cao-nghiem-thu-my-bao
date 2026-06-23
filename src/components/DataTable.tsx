import React, { useState } from 'react';
import { ReportData } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  data: ReportData[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Thành công':
        return <span className="px-2 py-[2px] text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Thành công</span>;
      case 'Lỗi':
        return <span className="px-2 py-[2px] text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">✕ Lỗi kỹ thuật</span>;
      case 'Đang trong ca':
        return <span className="px-2 py-[2px] text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">⌛ Đang xử lý</span>;
      default:
        return <span className="px-2 py-[2px] text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 p-5 flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Bảng chi tiết dữ liệu nghiệm thu</h3>
            <p className="text-[11px] font-medium text-slate-500">Hiển thị chi tiết từng phiên hỗ trợ của kỹ thuật viên</p>
        </div>
      </div>
      
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">Hợp đồng</th>
              <th className="p-3 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">Kỹ thuật viên</th>
              <th className="p-3 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">Tỉnh</th>
              <th className="p-3 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">Kịch bản</th>
              <th className="p-3 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">Băng tần</th>
              <th className="p-3 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">Trạng thái</th>
              <th className="p-3 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">Thời gian TH</th>
              <th className="p-3 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-3 border-b border-slate-50">
                    {row.contract === 'N/A' ? <span className="text-slate-400 font-semibold italic">N/A</span> : <span className="font-bold text-slate-800">{row.contract}</span>}
                  </td>
                  <td className="p-3 border-b border-slate-50">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{row.technician.split('@')[0]}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{row.technician}</span>
                    </div>
                  </td>
                  <td className="p-3 border-b border-slate-50 font-semibold text-slate-600">{row.province}</td>
                  <td className="p-3 border-b border-slate-50 text-slate-500">{row.scenario}</td>
                  <td className="p-3 border-b border-slate-50">
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">{row.band}</span>
                  </td>
                  <td className="p-3 border-b border-slate-50">{getStatusBadge(row.status)}</td>
                  <td className="p-3 border-b border-slate-50 font-mono text-slate-500 text-[11px]">{row.duration}</td>
                  <td className="p-3 border-b border-slate-50 text-[11px] text-slate-400 font-medium whitespace-nowrap">{row.dateCreated}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[13px] font-medium text-slate-400">
                  Không tìm thấy dữ liệu phù hợp với bộ lọc
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[12px] text-slate-500 font-semibold">
            Đang hiển thị <span className="text-slate-800">{startIndex + 1}</span> đến <span className="text-slate-800">{Math.min(startIndex + itemsPerPage, data.length)}</span> trong tổng số <span className="text-slate-800">{data.length}</span> kết quả
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white text-[12px] font-bold rounded-md shadow-sm">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
