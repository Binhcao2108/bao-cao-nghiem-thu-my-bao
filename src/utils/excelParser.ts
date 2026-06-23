import * as XLSX from 'xlsx';
import { ReportData } from '../types';

function getCleanValue(item: any, possibleHeaders: string[], defaultValue = "") {
  const itemKeys = Object.keys(item);
  const normPossibles = possibleHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ""));
  for (let i = 0; i < possibleHeaders.length; i++) {
      const target = normPossibles[i];
      if (!target) continue;
      for (let k = 0; k < itemKeys.length; k++) {
          const originalKey = itemKeys[k];
          if (!originalKey) continue;
          const normKey = originalKey.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "");
          if (!normKey) continue;
          if (normKey === target || normKey.includes(target) || target.includes(normKey)) {
              return item[originalKey] !== undefined && item[originalKey] !== null ? String(item[originalKey]).trim() : defaultValue;
          }
      }
  }
  return defaultValue;
}

export const parseExcelFile = async (file: File): Promise<ReportData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        let selectedSheetName = "";
        let bestJsonData: any[] = [];
        let maxTechnicalHeadersScore = -1;

        for (let sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
            if (rows.length === 0) continue;

            let bestHeaderRowIdx = 0;
            let maxHeaderScore = -1;

            for (let i = 0; i < Math.min(rows.length, 20); i++) {
                let score = 0;
                const row = rows[i];
                if (!row || !Array.isArray(row)) continue;
                
                row.forEach((cell: any) => {
                    if (typeof cell !== 'string') return;
                    const norm = cell.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "");
                    if (!norm) return;
                    if (["hợpđồng", "hopdong", "mahd", "sohd"].some(kw => norm.includes(kw))) score += 10;
                    if (["kỹthuật", "kythuat", "ktv", "nhânviên", "nhanvien", "email"].some(kw => norm.includes(kw))) score += 10;
                    if (["tỉnh", "tinh", "province", "chinhanh", "chinánh"].some(kw => norm.includes(kw))) score += 10;
                    if (["trạngthái", "trangthai", "status", "kếtquả"].some(kw => norm.includes(kw))) score += 10;
                    if (["kịchbản", "kichban", "scenario"].some(kw => norm.includes(kw))) score += 10;
                });

                if (score > maxHeaderScore) {
                    maxHeaderScore = score;
                    bestHeaderRowIdx = i;
                }
            }

            const finalScore = maxHeaderScore * Math.min(rows.length - bestHeaderRowIdx, 150);
            
            if (finalScore > maxTechnicalHeadersScore && maxHeaderScore > 0) {
                maxTechnicalHeadersScore = finalScore;
                selectedSheetName = sheetName;
                const headers = rows[bestHeaderRowIdx];
                const dataRows = rows.slice(bestHeaderRowIdx + 1);
                bestJsonData = dataRows.map(rowArr => {
                    const obj: any = {};
                    headers.forEach((h: any, idx: number) => {
                        const key = (h !== undefined && h !== null && h !== "") ? String(h).trim() : `__EMPTY_${idx}`;
                        obj[key] = rowArr[idx] !== undefined ? rowArr[idx] : "";
                    });
                    return obj;
                });
            }
        }

        if (!selectedSheetName && workbook.SheetNames.length > 0) {
            selectedSheetName = workbook.SheetNames[0];
            bestJsonData = XLSX.utils.sheet_to_json(workbook.Sheets[selectedSheetName], { defval: "" });
        }
        
        const parsedData = bestJsonData.map((item, index) => {
          const contract = getCleanValue(item, ["hợpđồng", "hopdong", "mahd", "sohd", "contract"], "");
          const scenario = getCleanValue(item, ["kịchbản", "kichban", "scenario", "dịchvụ"], "Khác");
          const technician = getCleanValue(item, ["kỹthuậtviên", "kythuatvien", "ktv", "nhânviên", "nhansu", "email"], "Chưa xác định");
          const province = getCleanValue(item, ["tỉnh", "tinh", "province", "chinánh"], "Khác");
          const origStatus = getCleanValue(item, ["trạngthái", "trangthai", "status", "kếtquả"], "Đang trong ca");
          const duration = getCleanValue(item, ["thờigian", "thoigianthuchien", "duration"], "00:00:00");
          const dateCreated = getCleanValue(item, ["ngàytạo", "ngaytao", "date", "createdat"], "");

          let status = "Đang trong ca";
          const lowerStatus = origStatus.toLowerCase();
          if (lowerStatus.includes("thành công") || lowerStatus.includes("success") || lowerStatus.includes("ok")) status = "Thành công";
          else if (lowerStatus.includes("lỗi") || lowerStatus.includes("thất bại") || lowerStatus.includes("fail") || lowerStatus.includes("error")) status = "Lỗi";

          let band = "Khác";
          const lowerScen = scenario.toLowerCase();
          if (lowerScen.includes("5ghz") || lowerScen.includes("5g")) band = "Băng tần 5GHz";
          else if (lowerScen.includes("2.4ghz") || lowerScen.includes("2.4g")) band = "Băng tần 2.4GHz";
          else if (lowerScen.includes("kép") || lowerScen.includes("kep")) band = "Băng tần kép";

          return {
            id: `row-${index}`,
            contract: contract === "" ? "N/A" : contract,
            scenario,
            band,
            technician,
            province,
            status,
            duration,
            dateCreated,
            originalRow: item
          };
        }).filter(item => {
            return !((item.contract === "N/A" || item.contract === "") && (item.technician === "Chưa xác định" || item.technician === "") && (item.province === "Khác" || item.province === ""));
        });
        
        resolve(parsedData);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
