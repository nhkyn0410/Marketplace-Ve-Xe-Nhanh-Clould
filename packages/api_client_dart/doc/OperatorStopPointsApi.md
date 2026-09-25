# api_client_dart.api.OperatorStopPointsApi

## Load the API package
```dart
import 'package:api_client_dart/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**stopPointControllerCreate**](OperatorStopPointsApi.md#stoppointcontrollercreate) | **POST** /v1/operator/stop-points | 
[**stopPointControllerGet**](OperatorStopPointsApi.md#stoppointcontrollerget) | **GET** /v1/operator/stop-points/{stopPointId} | 
[**stopPointControllerList**](OperatorStopPointsApi.md#stoppointcontrollerlist) | **GET** /v1/operator/stop-points | 
[**stopPointControllerUpdate**](OperatorStopPointsApi.md#stoppointcontrollerupdate) | **PUT** /v1/operator/stop-points/{stopPointId} | 


# **stopPointControllerCreate**
> OperatorStopPointResponseDtoOutput stopPointControllerCreate(operatorStopPointInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorStopPointsApi();
final OperatorStopPointInputDto operatorStopPointInputDto = ; // OperatorStopPointInputDto | 

try {
    final response = api.stopPointControllerCreate(operatorStopPointInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorStopPointsApi->stopPointControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **operatorStopPointInputDto** | [**OperatorStopPointInputDto**](OperatorStopPointInputDto.md)|  | 

### Return type

[**OperatorStopPointResponseDtoOutput**](OperatorStopPointResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **stopPointControllerGet**
> OperatorStopPointResponseDtoOutput stopPointControllerGet(stopPointId)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorStopPointsApi();
final String stopPointId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.stopPointControllerGet(stopPointId);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorStopPointsApi->stopPointControllerGet: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **stopPointId** | **String**|  | 

### Return type

[**OperatorStopPointResponseDtoOutput**](OperatorStopPointResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **stopPointControllerList**
> OperatorStopPointListResponseDtoOutput stopPointControllerList(status, cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorStopPointsApi();
final String status = status_example; // String | 
final String cursor = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final num limit = 8.14; // num | 

try {
    final response = api.stopPointControllerList(status, cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorStopPointsApi->stopPointControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**OperatorStopPointListResponseDtoOutput**](OperatorStopPointListResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **stopPointControllerUpdate**
> OperatorStopPointResponseDtoOutput stopPointControllerUpdate(stopPointId, operatorStopPointInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorStopPointsApi();
final String stopPointId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final OperatorStopPointInputDto operatorStopPointInputDto = ; // OperatorStopPointInputDto | 

try {
    final response = api.stopPointControllerUpdate(stopPointId, operatorStopPointInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorStopPointsApi->stopPointControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **stopPointId** | **String**|  | 
 **operatorStopPointInputDto** | [**OperatorStopPointInputDto**](OperatorStopPointInputDto.md)|  | 

### Return type

[**OperatorStopPointResponseDtoOutput**](OperatorStopPointResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

