# api_client_dart.api.CatalogApi

## Load the API package
```dart
import 'package:api_client_dart/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**catalogControllerListAmenities**](CatalogApi.md#catalogcontrollerlistamenities) | **GET** /v1/catalog/amenities | 
[**catalogControllerListProvinces**](CatalogApi.md#catalogcontrollerlistprovinces) | **GET** /v1/catalog/provinces | 
[**catalogControllerListStopPoints**](CatalogApi.md#catalogcontrollerliststoppoints) | **GET** /v1/catalog/stop-points | 
[**catalogControllerListVehicleTypes**](CatalogApi.md#catalogcontrollerlistvehicletypes) | **GET** /v1/catalog/vehicle-types | 
[**catalogControllerListWards**](CatalogApi.md#catalogcontrollerlistwards) | **GET** /v1/catalog/wards | 


# **catalogControllerListAmenities**
> AmenityListResponseDtoOutput catalogControllerListAmenities()



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getCatalogApi();

try {
    final response = api.catalogControllerListAmenities();
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->catalogControllerListAmenities: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**AmenityListResponseDtoOutput**](AmenityListResponseDtoOutput.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **catalogControllerListProvinces**
> ProvinceListResponseDtoOutput catalogControllerListProvinces()



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getCatalogApi();

try {
    final response = api.catalogControllerListProvinces();
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->catalogControllerListProvinces: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ProvinceListResponseDtoOutput**](ProvinceListResponseDtoOutput.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **catalogControllerListStopPoints**
> StopPointListResponseDtoOutput catalogControllerListStopPoints(provinceId, wardId, type, cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getCatalogApi();
final String provinceId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String wardId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String type = type_example; // String | 
final String cursor = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final num limit = 8.14; // num | 

try {
    final response = api.catalogControllerListStopPoints(provinceId, wardId, type, cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->catalogControllerListStopPoints: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provinceId** | **String**|  | [optional] 
 **wardId** | **String**|  | [optional] 
 **type** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**StopPointListResponseDtoOutput**](StopPointListResponseDtoOutput.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **catalogControllerListVehicleTypes**
> VehicleTypeListResponseDtoOutput catalogControllerListVehicleTypes()



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getCatalogApi();

try {
    final response = api.catalogControllerListVehicleTypes();
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->catalogControllerListVehicleTypes: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**VehicleTypeListResponseDtoOutput**](VehicleTypeListResponseDtoOutput.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **catalogControllerListWards**
> WardListResponseDtoOutput catalogControllerListWards(provinceId)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getCatalogApi();
final String provinceId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.catalogControllerListWards(provinceId);
    print(response);
} on DioException catch (e) {
    print('Exception when calling CatalogApi->catalogControllerListWards: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provinceId** | **String**|  | 

### Return type

[**WardListResponseDtoOutput**](WardListResponseDtoOutput.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

