# api_client_dart.api.OperatorRoutesApi

## Load the API package
```dart
import 'package:api_client_dart/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**routeControllerCreate**](OperatorRoutesApi.md#routecontrollercreate) | **POST** /v1/operator/routes | 
[**routeControllerGet**](OperatorRoutesApi.md#routecontrollerget) | **GET** /v1/operator/routes/{routeId} | 
[**routeControllerList**](OperatorRoutesApi.md#routecontrollerlist) | **GET** /v1/operator/routes | 
[**routeControllerUpdate**](OperatorRoutesApi.md#routecontrollerupdate) | **PUT** /v1/operator/routes/{routeId} | 


# **routeControllerCreate**
> RouteResponseDtoOutput routeControllerCreate(routeInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorRoutesApi();
final RouteInputDto routeInputDto = ; // RouteInputDto | 

try {
    final response = api.routeControllerCreate(routeInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorRoutesApi->routeControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **routeInputDto** | [**RouteInputDto**](RouteInputDto.md)|  | 

### Return type

[**RouteResponseDtoOutput**](RouteResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **routeControllerGet**
> RouteResponseDtoOutput routeControllerGet(routeId)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorRoutesApi();
final String routeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.routeControllerGet(routeId);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorRoutesApi->routeControllerGet: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **routeId** | **String**|  | 

### Return type

[**RouteResponseDtoOutput**](RouteResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **routeControllerList**
> RouteListResponseDtoOutput routeControllerList(status, cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorRoutesApi();
final String status = status_example; // String | 
final String cursor = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final num limit = 8.14; // num | 

try {
    final response = api.routeControllerList(status, cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorRoutesApi->routeControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**RouteListResponseDtoOutput**](RouteListResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **routeControllerUpdate**
> RouteResponseDtoOutput routeControllerUpdate(routeId, routeInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorRoutesApi();
final String routeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final RouteInputDto routeInputDto = ; // RouteInputDto | 

try {
    final response = api.routeControllerUpdate(routeId, routeInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorRoutesApi->routeControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **routeId** | **String**|  | 
 **routeInputDto** | [**RouteInputDto**](RouteInputDto.md)|  | 

### Return type

[**RouteResponseDtoOutput**](RouteResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

