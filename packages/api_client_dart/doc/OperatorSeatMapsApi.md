# api_client_dart.api.OperatorSeatMapsApi

## Load the API package
```dart
import 'package:api_client_dart/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**seatMapControllerCreate**](OperatorSeatMapsApi.md#seatmapcontrollercreate) | **POST** /v1/operator/seat-maps | 
[**seatMapControllerGet**](OperatorSeatMapsApi.md#seatmapcontrollerget) | **GET** /v1/operator/seat-maps/{seatMapId} | 
[**seatMapControllerList**](OperatorSeatMapsApi.md#seatmapcontrollerlist) | **GET** /v1/operator/seat-maps | 
[**seatMapControllerUpdate**](OperatorSeatMapsApi.md#seatmapcontrollerupdate) | **PUT** /v1/operator/seat-maps/{seatMapId} | 


# **seatMapControllerCreate**
> SeatMapResponseDtoOutput seatMapControllerCreate(seatMapInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorSeatMapsApi();
final SeatMapInputDto seatMapInputDto = ; // SeatMapInputDto | 

try {
    final response = api.seatMapControllerCreate(seatMapInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorSeatMapsApi->seatMapControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **seatMapInputDto** | [**SeatMapInputDto**](SeatMapInputDto.md)|  | 

### Return type

[**SeatMapResponseDtoOutput**](SeatMapResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **seatMapControllerGet**
> SeatMapResponseDtoOutput seatMapControllerGet(seatMapId)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorSeatMapsApi();
final String seatMapId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.seatMapControllerGet(seatMapId);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorSeatMapsApi->seatMapControllerGet: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **seatMapId** | **String**|  | 

### Return type

[**SeatMapResponseDtoOutput**](SeatMapResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **seatMapControllerList**
> SeatMapListResponseDtoOutput seatMapControllerList(cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorSeatMapsApi();
final String cursor = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final num limit = 8.14; // num | 

try {
    final response = api.seatMapControllerList(cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorSeatMapsApi->seatMapControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | **String**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**SeatMapListResponseDtoOutput**](SeatMapListResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **seatMapControllerUpdate**
> SeatMapResponseDtoOutput seatMapControllerUpdate(seatMapId, seatMapInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorSeatMapsApi();
final String seatMapId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final SeatMapInputDto seatMapInputDto = ; // SeatMapInputDto | 

try {
    final response = api.seatMapControllerUpdate(seatMapId, seatMapInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorSeatMapsApi->seatMapControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **seatMapId** | **String**|  | 
 **seatMapInputDto** | [**SeatMapInputDto**](SeatMapInputDto.md)|  | 

### Return type

[**SeatMapResponseDtoOutput**](SeatMapResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

