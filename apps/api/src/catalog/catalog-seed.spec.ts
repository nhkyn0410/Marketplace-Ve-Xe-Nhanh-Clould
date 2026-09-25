import { describe, expect, it } from "vitest";
import { StopPointType } from "../database/prisma.types";
import {
  AMENITIES,
  catalogSeedData,
  parseAdministrativeUnitsCsv,
  SAMPLE_STOP_POINTS,
  VEHICLE_TYPES,
} from "./catalog-seed";

const HEADER = "province_code,province_name,ward_code,ward_name";
const BOM = String.fromCharCode(0xfeff);
/** Ký tự Node chèn khi đọc file không phải UTF-8 bằng `readFileSync(path, "utf8")`. */
const REPLACEMENT_CHARACTER = String.fromCharCode(0xfffd);

function csv(...rows: string[]): string {
  return [HEADER, ...rows].join("\n");
}

describe("parseAdministrativeUnitsCsv — file danh mục chính thức (Q4)", () => {
  it("gom tỉnh duy nhất, giữ mã có số 0 đầu, chấp nhận BOM/CRLF/ô có nháy và dòng trống cuối file", () => {
    const text = `${BOM}${HEADER}\r\n01,Thành phố Hà Nội,00004,Phường Ba Đình\r\n01,Thành phố Hà Nội,00008,"Phường ""Mẫu"", có phẩy"\r\n79,Thành phố Hồ Chí Minh,26734,Phường Sài Gòn\r\n\r\n`;

    expect(parseAdministrativeUnitsCsv(text)).toEqual({
      provinces: [
        { code: "01", name: "Thành phố Hà Nội" },
        { code: "79", name: "Thành phố Hồ Chí Minh" },
      ],
      wards: [
        { code: "00004", name: "Phường Ba Đình", provinceCode: "01" },
        { code: "00008", name: 'Phường "Mẫu", có phẩy', provinceCode: "01" },
        { code: "26734", name: "Phường Sài Gòn", provinceCode: "79" },
      ],
    });
  });

  it.each([
    ["sai tiêu đề", "ma_tinh,ten_tinh,ma_xa,ten_xa\n01,A,00004,B", /Dòng 1: tiêu đề/],
    ["dấu chấm phẩy", `${HEADER.replaceAll(",", ";")}\n01;A;00004;B`, /Dòng 1: .*dấu chấm phẩy/],
    ["file không phải UTF-8", csv(`01,Th${REPLACEMENT_CHARACTER}nh ph${REPLACEMENT_CHARACTER},00004,B`), /Dòng 2: ký tự lỗi mã hoá/],
    ["file rỗng", "", /Dòng 1: tiêu đề/],
    ["chỉ có tiêu đề", HEADER, /không có dòng dữ liệu/],
    ["Excel xoá số 0 đầu mã tỉnh", csv("1,A,00004,B"), /Dòng 2: mã tỉnh "1"/],
    ["Excel xoá số 0 đầu mã xã", csv("01,A,4,B"), /Dòng 2: mã xã "4"/],
    ["thiếu cột", csv("01,A,00004"), /Dòng 2: cần đúng 4 cột/],
    ["dấu nháy chưa đóng", csv('01,"A,00004,B'), /Dòng 2: cần đúng 4 cột/],
    ["dòng trống giữa file", csv("01,A,00004,B", "", "01,A,00008,C"), /Dòng 3: cần đúng 4 cột/],
    ["tên trống", csv("01,A,00004, "), /Dòng 2: tên tỉnh và tên xã/],
    ["một mã tỉnh hai tên", csv("01,A,00004,B", "01,A2,00008,C"), /Dòng 3: mã tỉnh 01 mang hai tên/],
    ["trùng mã xã", csv("01,A,00004,B", "02,C,00004,D"), /Dòng 3: trùng mã xã 00004/],
  ])("từ chối %s", (_case, text, message) => {
    expect(() => parseAdministrativeUnitsCsv(text)).toThrow(message);
  });

  it("chuẩn hoá NFC: cùng tên lưu dạng tổ hợp dấu (NFD) và dựng sẵn (NFC) không bị coi là hai tên", () => {
    const nfd = "Thành phố Hà Nội".normalize("NFD");
    const parsed = parseAdministrativeUnitsCsv(csv(`01,${nfd},00004,B`, "01,Thành phố Hà Nội,00008,C"));
    expect(parsed.provinces).toEqual([{ code: "01", name: "Thành phố Hà Nội".normalize("NFC") }]);
  });
});

describe("catalogSeedData — dữ liệu theo môi trường", () => {
  const units = parseAdministrativeUnitsCsv(csv("01,A,00004,B"));

  it("bến xe mẫu chỉ có khi xin tường minh; mặc định không có ở mọi môi trường", () => {
    for (const nodeEnv of ["production", "development", undefined]) {
      expect(catalogSeedData(units, { nodeEnv, withSamples: false }).sampleStopPoints).toEqual([]);
    }
    expect(catalogSeedData(units, { nodeEnv: "development", withSamples: true }).sampleStopPoints).toBe(
      SAMPLE_STOP_POINTS,
    );
    expect(catalogSeedData(units, { nodeEnv: undefined, withSamples: true }).sampleStopPoints).toBe(
      SAMPLE_STOP_POINTS,
    );
  });

  it.each(["production", " production "])("xin bến mẫu khi NODE_ENV=%j → từ chối", (nodeEnv) => {
    expect(() => catalogSeedData(units, { nodeEnv, withSamples: true })).toThrow(/production/);
  });

  it("loại xe đúng 4 mã GLOSSARY; mã loại xe/tiện ích không trùng", () => {
    expect(VEHICLE_TYPES.map((item) => item.code)).toEqual(["SEATER", "SLEEPER", "LIMOUSINE", "CABIN"]);
    expect(new Set(AMENITIES.map((item) => item.code)).size).toBe(AMENITIES.length);
  });

  it("bến mẫu có toạ độ trong phạm vi CHECK của DB, loại hợp lệ, mã tỉnh 2 chữ số", () => {
    for (const sample of SAMPLE_STOP_POINTS) {
      expect(Math.abs(sample.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(sample.longitude)).toBeLessThanOrEqual(180);
      expect(Object.values(StopPointType)).toContain(sample.type);
      expect(sample.provinceCode).toMatch(/^\d{2}$/);
    }
  });
});
