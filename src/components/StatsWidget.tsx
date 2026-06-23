import React from 'react';
import { ReportData } from '../types';

interface StatsWidgetProps {
  data: ReportData[];
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ data }) => {
  const total = data.length;
  const success = data.filter(d => d.status === 'Thành công').length;
  const error = data.filter(d => d.status === 'Lỗi').length;
  const inProgress = data.filter(d => d.status === 'Đang trong ca').length;
  const naContracts = data.filter(d => d.contract === 'N/A').length;

  const successPct = total > 0 ? ((success / total) * 100).toFixed(1) : '0.0';
  const errorPct = total > 0 ? ((error / total) * 100).toFixed(1) : '0.0';
  const inProgressPct = total > 0 ? ((inProgress / total) * 100).toFixed(1) : '0.0';
  
  const totalResolved = success + error;
  const errorRate = totalResolved > 0 ? ((error / totalResolved) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng số ca</span>
          <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">∑</div>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold text-slate-900">{total.toLocaleString()}</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Số lượng bản ghi lọc</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thành công</span>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">✓</div>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold text-emerald-600">{success.toLocaleString()}</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-1">{successPct}% tổng số ca</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Báo Lỗi</span>
          <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center text-xs">✕</div>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold text-rose-600">{error.toLocaleString()}</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-1">{errorPct}% tổng số ca</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đang trong ca</span>
          <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-xs">⌛</div>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold text-amber-600">{inProgress.toLocaleString()}</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-1">{inProgressPct}% tổng số ca</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ lỗi</span>
          <div className="w-7 h-7 rounded-md bg-red-100 text-red-700 flex items-center justify-center text-xs">!</div>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold text-red-700">{errorRate}%</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Trên tổng hoàn thành</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hợp đồng N/A</span>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs">?</div>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold text-slate-700">{naContracts.toLocaleString()}</h4>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Thiếu thông tin số HĐ</p>
        </div>
      </div>
    </div>
  );
};
