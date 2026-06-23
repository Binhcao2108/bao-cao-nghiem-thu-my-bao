import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { ReportData } from '../types';

interface ChartAreaProps {
  data: ReportData[];
}

export const ChartArea: React.FC<ChartAreaProps> = ({ data }) => {
  const statusData = useMemo(() => {
    const success = data.filter(d => d.status === 'Thành công').length;
    const error = data.filter(d => d.status === 'Lỗi').length;
    const inProgress = data.filter(d => d.status === 'Đang trong ca').length;
    
    return [
      { name: 'Thành công', value: success, color: '#10b981' }, 
      { name: 'Lỗi', value: error, color: '#f43f5e' },    
      { name: 'Đang xử lý', value: inProgress, color: '#f59e0b' }        
    ].filter(d => d.value > 0);
  }, [data]);

  const bandData = useMemo(() => {
    const bands: Record<string, number> = {};
    data.forEach(d => {
      bands[d.band] = (bands[d.band] || 0) + 1;
    });
    const colors = ['#3b82f6', '#8b5cf6', '#0ea5e9', '#64748b'];
    return Object.keys(bands).map((k, i) => ({
      name: k,
      value: bands[k],
      color: colors[i % colors.length]
    })).filter(d => d.value > 0);
  }, [data]);

  const regionData = useMemo(() => {
    const regCounts: Record<string, {success: number, error: number, total: number}> = {};
    data.forEach(d => {
      // fallback if region is not present directly
      const r = d.region || 'Khác';
      if (!regCounts[r]) regCounts[r] = { success: 0, error: 0, total: 0 };
      regCounts[r].total += 1;
      if (d.status === 'Thành công') regCounts[r].success += 1;
      if (d.status === 'Lỗi') regCounts[r].error += 1;
    });

    return Object.keys(regCounts).map(r => ({
      name: r,
      'Thành công': regCounts[r].success,
      'Lỗi': regCounts[r].error,
      total: regCounts[r].total
    })).sort((a, b) => b.total - a.total);
  }, [data]);

  const provinceData = useMemo(() => {
    const provCounts: Record<string, {success: number, error: number, total: number}> = {};
    data.forEach(d => {
      if (!provCounts[d.province]) provCounts[d.province] = { success: 0, error: 0, total: 0 };
      provCounts[d.province].total += 1;
      if (d.status === 'Thành công') provCounts[d.province].success += 1;
      if (d.status === 'Lỗi') provCounts[d.province].error += 1;
    });

    return Object.keys(provCounts).map(p => ({
      name: p.length > 12 ? p.substring(0, 10) + '...' : p,
      'Thành công': provCounts[p].success,
      'Lỗi': provCounts[p].error,
      total: provCounts[p].total
    })).sort((a, b) => b.total - a.total).slice(0, 15);
  }, [data]);

  const ktvCountData = useMemo(() => {
    const ktvByProv: Record<string, Set<string>> = {};
    data.forEach(d => {
      if (!ktvByProv[d.province]) ktvByProv[d.province] = new Set();
      ktvByProv[d.province].add(d.technician);
    });
    return Object.keys(ktvByProv).map(p => ({
      name: p.length > 12 ? p.substring(0, 10) + '...' : p,
      'Số KTV': ktvByProv[p].size
    })).sort((a, b) => b['Số KTV'] - a['Số KTV']).slice(0, 15);
  }, [data]);

  const scenarioData = useMemo(() => {
    const scenCounts: Record<string, {success: number, error: number, total: number}> = {};
    data.forEach(d => {
      if (!scenCounts[d.scenario]) scenCounts[d.scenario] = { success: 0, error: 0, total: 0 };
      scenCounts[d.scenario].total += 1;
      if (d.status === 'Thành công') scenCounts[d.scenario].success += 1;
      if (d.status === 'Lỗi') scenCounts[d.scenario].error += 1;
    });

    const sortedScens = Object.keys(scenCounts).map(k => ({
      name: k.length > 15 ? k.substring(0,12) + '...' : k,
      'Thành công': scenCounts[k].success,
      'Lỗi': scenCounts[k].error,
      total: scenCounts[k].total
    })).sort((a, b) => b.total - a.total).slice(0, 12);
    return sortedScens;
  }, [data]);

  const techErrorData = useMemo(() => {
    const techMap: Record<string, {success: number, error: number, total: number}> = {};
    data.forEach(d => {
      const techName = d.technician.split('@')[0];
      if (!techMap[techName]) techMap[techName] = { success: 0, error: 0, total: 0 };
      techMap[techName].total += 1;
      if (d.status === 'Thành công') techMap[techName].success += 1;
      if (d.status === 'Lỗi') techMap[techName].error += 1;
    });
    return Object.keys(techMap).map(k => ({
      name: k,
      'Thành công': techMap[k].success,
      'Lỗi': techMap[k].error
    })).sort((a, b) => b['Lỗi'] - a['Lỗi']).slice(0, 15);
  }, [data]);

  const customTooltip = { borderRadius: '8px', fontSize: '13px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-[13px] uppercase tracking-wider">Trực quan hóa Dữ liệu Nghiệm thu</h3>
      </div>
      
      {/* Top Row: 2 pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col">
          <span className="text-[12px] font-bold text-slate-600 mb-4 text-center">Tỷ lệ Trạng thái</span>
          <div className="w-full h-[250px] relative">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" label={({percent}) => `${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={customTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px] font-medium">Không có dữ liệu</div>}
          </div>
        </div>

        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col">
          <span className="text-[12px] font-bold text-slate-600 mb-4 text-center">Tỷ lệ Băng tần</span>
          <div className="w-full h-[250px] relative">
            {bandData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bandData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" label={({percent}) => `${(percent * 100).toFixed(0)}%`}>
                    {bandData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={customTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px] font-medium">Không có dữ liệu</div>}
          </div>
        </div>
      </div>

      {/* Region Row: Region bar chart */}
      <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col mt-6">
        <span className="text-[12px] font-bold text-slate-600 mb-4 text-center">Thống kê theo Vùng / Miền</span>
        <div className="w-full h-[300px] relative">
          {regionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-5} />
                <RechartsTooltip contentStyle={customTooltip} cursor={{ fill: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b', paddingTop: '5px' }} iconType="circle" />
                <Bar dataKey="Thành công" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]}>
                  <LabelList dataKey="Thành công" position="center" fill="#fff" fontSize={10} formatter={(v: number) => v > 0 ? v : ''} />
                </Bar>
                <Bar dataKey="Lỗi" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="Lỗi" position="top" fill="#f43f5e" fontSize={10} formatter={(v: number) => v > 0 ? v : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px] font-medium">Không có dữ liệu</div>}
        </div>
      </div>

      {/* Middle Row: Province bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col">
          <span className="text-[12px] font-bold text-slate-600 mb-4 text-center">Thống kê theo Tỉnh Thành (Top 15)</span>
          <div className="w-full h-[300px] relative">
            {provinceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-5} />
                  <RechartsTooltip contentStyle={customTooltip} cursor={{ fill: '#f1f5f9' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b', paddingTop: '5px' }} iconType="circle" />
                  <Bar dataKey="Thành công" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]}>
                    <LabelList dataKey="Thành công" position="center" fill="#fff" fontSize={10} formatter={(v: number) => v > 0 ? v : ''} />
                  </Bar>
                  <Bar dataKey="Lỗi" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Lỗi" position="top" fill="#f43f5e" fontSize={10} formatter={(v: number) => v > 0 ? v : ''} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px] font-medium">Không có dữ liệu</div>}
          </div>
        </div>
        
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col">
          <span className="text-[12px] font-bold text-slate-600 mb-4 text-center">Số lượng KTV tham gia theo Tỉnh (Top 15)</span>
          <div className="w-full h-[300px] relative">
            {ktvCountData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ktvCountData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-5} />
                  <RechartsTooltip contentStyle={customTooltip} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="Số KTV" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Số KTV" position="top" fill="#8b5cf6" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px] font-medium">Không có dữ liệu</div>}
          </div>
        </div>
      </div>

      {/* Bottom Row: 2 bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-7 border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col">
          <span className="text-[12px] font-bold text-slate-600 mb-4 text-center">Thống kê Lỗi theo Kịch bản (Top 12)</span>
          <div className="w-full h-[450px] relative">
            {scenarioData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-5} />
                  <RechartsTooltip contentStyle={customTooltip} cursor={{ fill: '#f1f5f9' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b', paddingTop: '10px' }} iconType="circle" />
                  <Bar dataKey="Thành công" fill="#34d399" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Thành công" position="top" fill="#34d399" fontSize={9} formatter={(v: number) => v > 0 ? v : ''} />
                  </Bar>
                  <Bar dataKey="Lỗi" fill="#fb7185" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Lỗi" position="top" fill="#fb7185" fontSize={9} formatter={(v: number) => v > 0 ? v : ''} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px] font-medium">Không có dữ liệu</div>}
          </div>
        </div>

        <div className="lg:col-span-5 border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col">
          <span className="text-[12px] font-bold text-slate-600 mb-4 text-center">Top Nhân viên báo lỗi nhiều nhất (Top 15)</span>
          <div className="w-full h-[450px] relative">
            {techErrorData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={techErrorData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-5} width={80} />
                  <RechartsTooltip contentStyle={customTooltip} cursor={{ fill: '#f1f5f9' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b', paddingTop: '10px' }} iconType="circle" />
                  <Bar dataKey="Lỗi" fill="#f43f5e" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="Lỗi" position="right" fill="#f43f5e" fontSize={10} formatter={(v: number) => v > 0 ? v : ''} />
                  </Bar>
                  <Bar dataKey="Thành công" fill="#e2e8f0" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="Thành công" position="right" fill="#94a3b8" fontSize={10} formatter={(v: number) => v > 0 ? v : ''} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px] font-medium">Không có dữ liệu</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
