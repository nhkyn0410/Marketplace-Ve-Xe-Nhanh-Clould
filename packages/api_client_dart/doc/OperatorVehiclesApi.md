# api_client_dart.api.OperatorVehiclesApi

## Load the API package
```dart
import 'package:api_client_dart/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**vehicleControllerCreate**](OperatorVehiclesApi.md#vehiclecontrollercreate) | **POST** /v1/operator/vehicles | 
[**vehicleControllerGet**](OperatorVehiclesApi.md#vehiclecontrollerget) | **GET** /v1/operator/vehicles/{vehicleId} | 
[**vehicleControllerList**](OperatorVehiclesApi.md#vehiclecontrollerlist) | **GET** /v1/operator/vehicles | 
[**vehicleControllerUpdate**](OperatorVehiclesApi.md#vehiclecontrollerupdate) | **PUT** /v1/operator/vehicles/{vehicleId} | 


# **vehicleControllerCreate**
> VehicleResponseDtoOutput vehicleControllerCreate(vehicleInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorVehiclesApi();
final VehicleInputDto vehicleInputDto = ; // VehicleInputDto | 

try {
    final response = api.vehicleControllerCreate(vehicleInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorVehiclesApi->vehicleControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vehicleInputDto** | [**VehicleInputDto**](VehicleInputDto.md)|  | 

### Return type

[**VehicleResponseDtoOutput**](VehicleResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **vehicleControllerGet**
> VehicleResponseDtoOutput vehicleControllerGet(vehicleId)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorVehiclesApi();
final String vehicleId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.vehicleControllerGet(vehicleId);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorVehiclesApi->vehicleControllerGet: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vehicleId** | **String**|  | 

### Return type

[**VehicleResponseDtoOutput**](VehicleResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **vehicleControllerList**
> VehicleListResponseDtoOutput vehicleControllerList(status, cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorVehiclesApi();
final String status = status_example; // String | 
final String cursor = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final num limit = 8.14; // num | 

try {
    final response = api.vehicleControllerList(status, cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorVehiclesApi->vehicleControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**VehicleListResponseDtoOutput**](VehicleListResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **vehicleControllerUpdate**
> VehicleResponseDtoOutput vehicleControllerUpdate(vehicleId, vehicleInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorVehiclesApi();
final String vehicleId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final VehicleInputDto vehicleInputDto = ; // VehicleInputDto | 

try {
    final response = api.vehicleControllerUpdate(vehicleId, vehicleInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorVehiclesApi->vehicleControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vehicleId** | **String**|  | 
 **vehicleInputDto** | [**VehicleInputDto**](VehicleInputDto.md)|  | 

### Return type

[**VehicleResponseDtoOutput**](VehicleResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

