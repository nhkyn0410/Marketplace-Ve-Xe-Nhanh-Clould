import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for CatalogApi
void main() {
  final instance = ApiClientDart().getCatalogApi();

  group(CatalogApi, () {
    //Future<AmenityListResponseDtoOutput> catalogControllerListAmenities() async
    test('test catalogControllerListAmenities', () async {
      // TODO
    });

    //Future<ProvinceListResponseDtoOutput> catalogControllerListProvinces() async
    test('test catalogControllerListProvinces', () async {
      // TODO
    });

    //Future<StopPointListResponseDtoOutput> catalogControllerListStopPoints({ String provinceId, String wardId, String type, String cursor, num limit }) async
    test('test catalogControllerListStopPoints', () async {
      // TODO
    });

    //Future<VehicleTypeListResponseDtoOutput> catalogControllerListVehicleTypes() async
    test('test catalogControllerListVehicleTypes', () async {
      // TODO
    });

    //Future<WardListResponseDtoOutput> catalogControllerListWards(String provinceId) async
    test('test catalogControllerListWards', () async {
      // TODO
    });

  });
}
