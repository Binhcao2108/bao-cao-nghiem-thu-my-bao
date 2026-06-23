import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Image as ImageIcon, Filter, FileSpreadsheet, X, Search, ChevronDown, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';

import { ReportData, FilterState } from '../types';
import { UploadArea } from './UploadArea';
import { StatsWidget } from './StatsWidget';
import { ChartArea } from './ChartArea';
import { DataTable } from './DataTable';
import { parseExcelFile, exportToExcel } from '../utils/excelParser';

const MultiSelect = ({ label, options, selected, onChange }: { label: string, options: string[], selected: string[], onChange: (val: string[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const displayValue = selected.length === 0 ? `Tất cả` : (selected.length === 1 ? selected[0] : `Đã chọn ${selected.length} mục`);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const lowerQuery = searchQuery.toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(lowerQuery));
  }, [options, searchQuery]);

  return (
    <div className="space-y-1.5 relative w-full lg:w-1/4" ref={containerRef}>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div 
        className="relative cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium truncate transition-colors ${selected.length > 0 ? 'text-blue-700 font-bold border-blue-200' : 'text-slate-700 group-hover:border-blue-400'}`}>
          {displayValue}
        </div>
        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </span>
      </div>
      
      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-100 shrink-0">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[12px] font-medium text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-60 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-[12px] text-center text-slate-400 font-medium italic">Không tìm thấy kết quả</div>
            ) : (
              filteredOptions.map((opt) => (
                <label key={opt} className="flex items-center px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors group">
                  <input 
                    type="checkbox" 
                    checked={selected.includes(opt)} 
                    onChange={() => toggleOption(opt)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-[13px] text-slate-700 font-medium group-hover:text-blue-600 transition-colors truncate">{opt}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<ReportData[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    province: [],
    scenario: [],
    technician: [],
    status: [],
    searchQuery: ''
  });

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setFileName(file.name);
    try {
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
      resetFilters();
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra khi đọc file. Vui lòng kiểm tra lại định dạng file.');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ province: [], scenario: [], technician: [], status: [], searchQuery: '' });
  };

  const availableOptions = useMemo(() => {
    if (!data) return { provinces: [], scenarios: [], technicians: [], statuses: [] };
    
    // Always available options based on full dataset
    const provs = Array.from(new Set(data.map(d => d.province))).sort();
    const scens = Array.from(new Set(data.map(d => d.scenario))).sort();
    const stats = Array.from(new Set(data.map(d => d.status))).sort();

    // Dynamically filter technicians based on selected province
    let validTechs = new Set<string>();
    if (filters.province.length > 0) {
      data.filter(d => filters.province.includes(d.province)).forEach(d => validTechs.add(d.technician));
    } else {
      data.forEach(d => validTechs.add(d.technician));
    }
    const techs = Array.from(validTechs).sort();

    return { provinces: provs, scenarios: scens, technicians: techs, statuses: stats };
  }, [data, filters.province]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item => {
      const matchProv = filters.province.length === 0 || filters.province.includes(item.province);
      const matchScen = filters.scenario.length === 0 || filters.scenario.includes(item.scenario);
      const matchTech = filters.technician.length === 0 || filters.technician.includes(item.technician);
      const matchStat = filters.status.length === 0 || filters.status.includes(item.status);
      
      let matchSearch = true;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        matchSearch = item.contract.toLowerCase().includes(q) || 
                      item.technician.toLowerCase().includes(q) || 
                      item.province.toLowerCase().includes(q);
      }
      return matchProv && matchScen && matchTech && matchStat && matchSearch;
    });
  }, [data, filters]);

  const handleExportExcel = () => {
    if (!filteredData || filteredData.length === 0) return;
    const exportData = filteredData.map(item => ({
      'Hợp Đồng': item.contract,
      'Kỹ Thuật Viên': item.technician,
      'Tỉnh': item.province,
      'Kịch Bản': item.scenario,
      'Băng Tần': item.band,
      'Trạng Thái': item.status,
      'Thời Gian': item.duration,
      'Ngày Tạo': item.dateCreated
    }));
    exportToExcel(exportData, `Bao_Cao_Nghiem_Thu_${new Date().getTime()}`);
  };

  const handleExportImage = async () => {
    const dashboardElement = document.getElementById('dashboard-report-area');
    if (!dashboardElement) return;
    try {
      // Small timeout to ensure fonts and styles are fully loaded
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await toPng(dashboardElement, {
        cacheBust: true,
        backgroundColor: '#f8fafc',
        pixelRatio: 2,
        filter: (node) => {
          if (node.tagName && node.tagName.toLowerCase() === 'button') {
            return false; // optional: ignore buttons entirely if you want
          }
          if (node.getAttribute && node.getAttribute('data-html2canvas-ignore') === 'true') {
            return false;
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Bao_Cao_Nghiem_Thu_${new Date().getTime()}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Không thể xuất hình ảnh.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl grid place-items-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            📊
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Báo Cáo Nghiệm Thu</h1>
            <p className="text-[11px] font-medium text-slate-500">Báo cáo nghiệm thu & giám sát băng tần</p>
          </div>
        </div>

        {data && (
          <div className="flex gap-3">
            <button
              onClick={handleExportImage}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Tải Hình Ảnh
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-[13px] font-bold text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Xuất Excel (.csv)
            </button>
            <button
              onClick={() => setData(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-rose-600 hover:bg-rose-50 transition-all shadow-sm ml-2"
              title="Tải file khác"
            >
              <X className="w-4 h-4" />
              Đóng
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-[1400px] mx-auto w-full">

        {!data ? (
          <div className="mt-10 max-w-2xl mx-auto w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-500 text-[13px] font-semibold">Đang đọc & chuẩn hóa dữ liệu...</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-extrabold mb-3">Cổng phân tích Nghiệm thu kết quả kỹ thuật</h2>
                <p className="text-slate-300 text-[13px] font-medium max-w-lg mb-8">
                  Hỗ trợ tải lên file báo cáo từ đội ngũ KTV, tự động phân tích tỷ lệ lỗi theo kịch bản, băng tần và theo từng khu vực tỉnh thành.
                </p>
                <UploadArea onFileUpload={handleFileUpload} />
              </div>
            )}
          </div>
        ) : (
          <div id="dashboard-report-area" className="flex flex-col gap-6">
            
            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200" data-html2canvas-ignore="true">
               <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">BỘ LỌC DỮ LIỆU ĐA LỰA CHỌN</h3>
                  </div>
                  <button onClick={resetFilters} className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center transition-colors">
                    <RefreshCw className="w-3 h-3 mr-1" /> Xóa tất cả bộ lọc
                  </button>
               </div>

               <div className="flex flex-col lg:flex-row gap-4">
                  <MultiSelect 
                    label="Tỉnh / Thành phố" 
                    options={availableOptions.provinces} 
                    selected={filters.province} 
                    onChange={v => setFilters(prev => ({...prev, province: v, technician: prev.technician.filter(t => availableOptions.technicians.includes(t))}))} 
                  />
                  <MultiSelect 
                    label="Kịch bản nghiệp vụ" 
                    options={availableOptions.scenarios} 
                    selected={filters.scenario} 
                    onChange={v => setFilters(prev => ({...prev, scenario: v}))} 
                  />
                  <MultiSelect 
                    label="Kỹ thuật viên" 
                    options={availableOptions.technicians} 
                    selected={filters.technician} 
                    onChange={v => setFilters(prev => ({...prev, technician: v}))} 
                  />
                  <MultiSelect 
                    label="Trạng thái" 
                    options={availableOptions.statuses} 
                    selected={filters.status} 
                    onChange={v => setFilters(prev => ({...prev, status: v}))} 
                  />
               </div>

               <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="relative w-full max-w-sm">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Tìm theo mã HĐ, tên KTV..." 
                      value={filters.searchQuery}
                      onChange={e => setFilters(prev => ({...prev, searchQuery: e.target.value}))}
                      className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-700 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all outline-none"
                    />
                  </div>
                  <div className="text-[13px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    {filteredData.length} kết quả
                  </div>
               </div>
            </div>

            <StatsWidget data={filteredData} />
            <ChartArea data={filteredData} />
            <DataTable data={filteredData} />
            
          </div>
        )}
        
      </div>
    </div>
  );
};
