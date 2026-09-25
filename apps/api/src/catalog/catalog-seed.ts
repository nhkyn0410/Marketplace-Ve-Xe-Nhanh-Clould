import type { DbTransaction } from "../database/prisma.service";
import { StopPointType } from "../database/prisma.types";

/**
 * Seed catalog (TASK-CAT-001, DB-MIG-04, quyết định Q4). Lõi nằm trong `src/` để test được; CLI mỏng ở
 * `prisma/catalog-seed.ts` lo env, kết nối owner và ngữ cảnh RLS `system`.
 * CREATE-ONLY: dòng đã có (theo `code`) giữ nguyên, để chạy lại không ghi đè sửa đổi của Admin (ADM-001).
 */

export const ADMINISTRATIVE_UNITS_CSV_HEADER = [
  "province_code",
  "province_name",
  "ward_code",
  "ward_name",
] as const;

export type AdministrativeUnits = {
  provinces: { code: string; name: string }[];
  wards: { code: string; name: string; provinceCode: string }[];
};

type CodedItem = { code: string; name: string; description?: string };

type SampleStopPoint = {
  name: string;
  type: StopPointType;
  address: string;
  provinceCode: string;
  /** Tra theo tên trong tỉnh (không phân biệt hoa/thường); không khớp thì bỏ qua bến này. */
  wardName: string;
  latitude: number;
  longitude: number;
};

export type CatalogSeedData = AdministrativeUnits & {
  vehicleTypes: CodedItem[];
  amenities: CodedItem[];
  sampleStopPoints: SampleStopPoint[];
};

export type CatalogSeedResult = {
  provinces: number;
  wards: number;
  vehicleTypes: number;
  amenities: number;
  stopPoints: number;
  skippedStopPoints: string[];
};

/** Loại phương tiện chuẩn theo GLOSSARY (seater, sleeper, limousine, cabin). */
export const VEHICLE_TYPES: CodedItem[] = [
  { code: "SEATER", name: "Ghế ngồi", description: "Xe khách ghế ngồi." },
  { code: "SLEEPER", name: "Giường nằm", description: "Xe khách giường nằm." },
  { code: "LIMOUSINE", name: "Limousine", description: "Xe ghế ngồi cao cấp, ít chỗ." },
  { code: "CABIN", name: "Cabin", description: "Xe giường nằm dạng phòng cabin riêng." },
];

/** Tiện ích cơ bản trên xe; Admin bổ sung qua ADM-001. */
export const AMENITIES: CodedItem[] = [
  { code: "AIR_CONDITIONER", name: "Điều hòa" },
  { code: "WIFI", name: "Wi-Fi" },
  { code: "WATER", name: "Nước uống" },
  { code: "BLANKET", name: "Chăn đắp" },
  { code: "USB_CHARGER", name: "Cổng sạc điện thoại" },
  { code: "TOILET", name: "Nhà vệ sinh trên xe" },
];

/**
 * Bến xe MẪU cho môi trường dev (KHÔNG seed production). Toạ độ gần đúng; tên phường sau sắp xếp 2025
 * chưa đối chiếu — nếu file danh mục chính thức không có phường trùng tên, bến đó bị bỏ qua kèm cảnh báo.
 */
export const SAMPLE_STOP_POINTS: SampleStopPoint[] = [
  {
    name: "Bến xe Miền Đông mới",
    type: StopPointType.BUS_STATION,
    address: "501 Hoàng Hữu Nam, TP. Hồ Chí Minh",
    provinceCode: "79",
    wardName: "Phường Long Bình",
    latitude: 10.8787,
    longitude: 106.8164,
  },
  {
    name: "Bến xe Miền Tây",
    type: StopPointType.BUS_STATION,
    address: "395 Kinh Dương Vương, TP. Hồ Chí Minh",
    provinceCode: "79",
    wardName: "Phường An Lạc",
    latitude: 10.7406,
    longitude: 106.619,
  },
  {
    name: "Bến xe Mỹ Đình",
    type: StopPointType.BUS_STATION,
    address: "20 Phạm Hùng, Hà Nội",
    provinceCode: "01",
    wardName: "Phường Từ Liêm",
    latitude: 21.0285,
    longitude: 105.7784,
  },
  {
    name: "Bến xe Nước Ngầm",
    type: StopPointType.BUS_STATION,
    address: "1 Ngọc Hồi, Hà Nội",
    provinceCode: "01",
    wardName: "Phường Hoàng Liệt",
    latitude: 20.9645,
    longitude: 105.8423,
  },
  {
    name: "Bến xe Trung tâm Đà Nẵng",
    type: StopPointType.BUS_STATION,
    address: "201 Tôn Đức Thắng, Đà Nẵng",
    provinceCode: "48",
    wardName: "Phường Liên Chiểu",
    latitude: 16.0622,
    longitude: 108.1717,
  },
  {
    name: "Bến xe liên tỉnh Đà Lạt",
    type: StopPointType.BUS_STATION,
    address: "01 Tô Hiến Thành, Lâm Đồng",
    provinceCode: "68",
    wardName: "Phường Xuân Hương - Đà Lạt",
    latitude: 11.9275,
    longitude: 108.4448,
  },
];

const SAMPLE_DESCRIPTION = "Dữ liệu mẫu cho môi trường dev — toạ độ gần đúng.";

/**
 * Ghép dữ liệu seed. Bến xe mẫu phải xin TƯỜNG MINH (`withSamples`) — mặc định không có, để lỡ trỏ
 * nhầm DB production mà quên `NODE_ENV` cũng không đăng dữ liệu mẫu; xin ở production thì từ chối.
 */
export function catalogSeedData(
  units: AdministrativeUnits,
  options: { nodeEnv: string | undefined; withSamples: boolean },
): CatalogSeedData {
  if (options.withSamples && options.nodeEnv?.trim() === "production") {
    throw new Error("Không seed bến xe mẫu ở production (bỏ --with-samples).");
  }
  return {
    ...units,
    vehicleTypes: VEHICLE_TYPES,
    amenities: AMENITIES,
    sampleStopPoints: options.withSamples ? SAMPLE_STOP_POINTS : [],
  };
}

/**
 * Đọc + kiểm file CSV danh mục hành chính chính thức (định dạng: `CAT-001-todo.md` Q4). Sai ở đâu ném
 * lỗi kèm số dòng — không bao giờ trả dữ liệu dở, để seed không ghi mã sai (vd. Excel xoá số 0 đầu).
 */
export function parseAdministrativeUnitsCsv(text: string): AdministrativeUnits {
  const BYTE_ORDER_MARK = 0xfeff; // Excel "CSV UTF-8" ghi BOM đầu file
  const lines = (text.charCodeAt(0) === BYTE_ORDER_MARK ? text.slice(1) : text).split(/\r?\n/);
  while (lines.length > 0 && lines[lines.length - 1]!.trim() === "") {
    lines.pop();
  }
  // File không phải UTF-8 (Excel "CSV (Comma delimited)") được Node đọc thành U+FFFD mà không báo lỗi;
  // mã vẫn là chữ số nên lọt mọi kiểm tra khác, và seed create-only không sửa lại được tên hỏng.
  const REPLACEMENT_CHARACTER = String.fromCharCode(0xfffd);
  const brokenLine = lines.findIndex((line) => line.includes(REPLACEMENT_CHARACTER));
  if (brokenLine >= 0) {
    throw new Error(`Dòng ${brokenLine + 1}: ký tự lỗi mã hoá — lưu lại file bằng "CSV UTF-8".`);
  }
  const [header, ...rows] = lines;
  const expected = ADMINISTRATIVE_UNITS_CSV_HEADER.join(",");
  const actual = header === undefined ? null : splitCsvLine(header)?.map((field) => field.trim().toLowerCase()).join(",");
  if (actual !== expected) {
    throw new Error(`Dòng 1: tiêu đề phải đúng "${expected}" (phân cách bằng dấu phẩy, không phải dấu chấm phẩy).`);
  }
  if (rows.length === 0) {
    throw new Error("File không có dòng dữ liệu nào.");
  }

  const provinceNames = new Map<string, string>();
  const wardCodes = new Set<string>();
  const wards: AdministrativeUnits["wards"] = [];
  rows.forEach((line, index) => {
    const lineNo = index + 2;
    // NFC: cùng một tên có thể lưu dạng dựng sẵn hoặc tổ hợp dấu; không chuẩn hoá thì so tên sai.
    const fields = splitCsvLine(line)?.map((field) => field.trim().normalize("NFC"));
    if (!fields || fields.length !== ADMINISTRATIVE_UNITS_CSV_HEADER.length) {
      throw new Error(`Dòng ${lineNo}: cần đúng 4 cột, dấu nháy phải đóng.`);
    }
    const [provinceCode, provinceName, wardCode, wardName] = fields as [string, string, string, string];
    if (!/^\d{2}$/.test(provinceCode)) {
      throw new Error(`Dòng ${lineNo}: mã tỉnh "${provinceCode}" phải gồm đúng 2 chữ số (giữ số 0 đầu).`);
    }
    if (!/^\d{5}$/.test(wardCode)) {
      throw new Error(`Dòng ${lineNo}: mã xã "${wardCode}" phải gồm đúng 5 chữ số (giữ số 0 đầu).`);
    }
    if (!provinceName || !wardName) {
      throw new Error(`Dòng ${lineNo}: tên tỉnh và tên xã không được trống.`);
    }
    const knownName = provinceNames.get(provinceCode);
    if (knownName !== undefined && knownName !== provinceName) {
      throw new Error(`Dòng ${lineNo}: mã tỉnh ${provinceCode} mang hai tên "${knownName}" và "${provinceName}".`);
    }
    if (wardCodes.has(wardCode)) {
      throw new Error(`Dòng ${lineNo}: trùng mã xã ${wardCode}.`);
    }
    provinceNames.set(provinceCode, provinceName);
    wardCodes.add(wardCode);
    wards.push({ code: wardCode, name: wardName, provinceCode });
  });

  return {
    provinces: [...provinceNames].map(([code, name]) => ({ code, name })),
    wards,
  };
}

/** Tách một dòng CSV (RFC 4180, không hỗ trợ xuống dòng trong ô); `null` nếu dấu nháy chưa đóng. */
function splitCsvLine(line: string): string[] | null {
  const fields: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }
  if (quoted) {
    return null;
  }
  fields.push(field);
  return fields;
}

/**
 * Ghi catalog create-only. `tx` PHẢI là transaction đã gắn scope `system`/`platform` (RLS chặn ghi ở
 * scope khác). Trả số dòng tạo mới; chạy lại lần hai trả toàn 0.
 */
export async function seedCatalog(tx: DbTransaction, data: CatalogSeedData): Promise<CatalogSeedResult> {
  const provinces = await tx.province.createMany({ data: data.provinces, skipDuplicates: true });
  const provinceIds = new Map(
    (
      await tx.province.findMany({
        where: { code: { in: data.provinces.map((province) => province.code) } },
        select: { id: true, code: true },
      })
    ).map((province) => [province.code, province.id]),
  );
  const wards = await tx.ward.createMany({
    data: data.wards.map((ward) => {
      const provinceId = provinceIds.get(ward.provinceCode);
      if (!provinceId) {
        throw new Error(`Xã ${ward.code} tham chiếu mã tỉnh ${ward.provinceCode} không có trong dữ liệu.`);
      }
      return { code: ward.code, name: ward.name, provinceId };
    }),
    skipDuplicates: true,
  });
  const vehicleTypes = await tx.vehicleType.createMany({ data: data.vehicleTypes, skipDuplicates: true });
  const amenities = await tx.amenity.createMany({
    data: data.amenities.map(({ code, name }) => ({ code, name })),
    skipDuplicates: true,
  });

  let stopPoints = 0;
  const skippedStopPoints: string[] = [];
  for (const sample of data.sampleStopPoints) {
    const ward = await tx.ward.findFirst({
      where: {
        province: { code: sample.provinceCode },
        name: { equals: sample.wardName, mode: "insensitive" },
      },
      select: { id: true, provinceId: true },
    });
    if (!ward) {
      skippedStopPoints.push(sample.name);
      continue;
    }
    // Bến xe chuẩn không có `code`: coi (tên, tỉnh) là khoá create-only của dữ liệu mẫu.
    const existing = await tx.stopPointCatalog.findFirst({
      where: { name: sample.name, provinceId: ward.provinceId },
      select: { id: true },
    });
    if (existing) {
      continue;
    }
    await tx.stopPointCatalog.create({
      data: {
        name: sample.name,
        type: sample.type,
        address: sample.address,
        provinceId: ward.provinceId,
        wardId: ward.id,
        latitude: sample.latitude,
        longitude: sample.longitude,
        description: SAMPLE_DESCRIPTION,
      },
    });
    stopPoints++;
  }

  return {
    provinces: provinces.count,
    wards: wards.count,
    vehicleTypes: vehicleTypes.count,
    amenities: amenities.count,
    stopPoints,
    skippedStopPoints,
  };
}
