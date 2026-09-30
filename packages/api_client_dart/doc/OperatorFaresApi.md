# api_client_dart.api.OperatorFaresApi

## Load the API package
```dart
import 'package:api_client_dart/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**fareControllerCreate**](OperatorFaresApi.md#farecontrollercreate) | **POST** /v1/operator/fares | 
[**fareControllerGet**](OperatorFaresApi.md#farecontrollerget) | **GET** /v1/operator/fares/{fareId} | 
[**fareControllerList**](OperatorFaresApi.md#farecontrollerlist) | **GET** /v1/operator/fares | 
[**fareControllerRevisions**](OperatorFaresApi.md#farecontrollerrevisions) | **GET** /v1/operator/fares/{fareId}/revisions | 
[**fareControllerUpdate**](OperatorFaresApi.md#farecontrollerupdate) | **PUT** /v1/operator/fares/{fareId} | 


# **fareControllerCreate**
> FareResponseDtoOutput fareControllerCreate(fareCreateInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorFaresApi();
final FareCreateInputDto fareCreateInputDto = ; // FareCreateInputDto | 

try {
    final response = api.fareControllerCreate(fareCreateInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorFaresApi->fareControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fareCreateInputDto** | [**FareCreateInputDto**](FareCreateInputDto.md)|  | 

### Return type

[**FareResponseDtoOutput**](FareResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **fareControllerGet**
> FareResponseDtoOutput fareControllerGet(fareId)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorFaresApi();
final String fareId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.fareControllerGet(fareId);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorFaresApi->fareControllerGet: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fareId** | **String**|  | 

### Return type

[**FareResponseDtoOutput**](FareResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **fareControllerList**
> FareListResponseDtoOutput fareControllerList(routeId, status, cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorFaresApi();
final String routeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String status = status_example; // String | 
final String cursor = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final num limit = 8.14; // num | 

try {
    final response = api.fareControllerList(routeId, status, cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorFaresApi->fareControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **routeId** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**FareListResponseDtoOutput**](FareListResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **fareControllerRevisions**
> FareRevisionListResponseDtoOutput fareControllerRevisions(fareId, cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorFaresApi();
final String fareId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final DateTime cursor = 2013-10-20T19:20:30+01:00; // DateTime | 
final num limit = 8.14; // num | 

try {
    final response = api.fareControllerRevisions(fareId, cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorFaresApi->fareControllerRevisions: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fareId** | **String**|  | 
 **cursor** | **DateTime**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**FareRevisionListResponseDtoOutput**](FareRevisionListResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **fareControllerUpdate**
> FareResponseDtoOutput fareControllerUpdate(fareId, fareUpdateInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorFaresApi();
final String fareId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final FareUpdateInputDto fareUpdateInputDto = ; // FareUpdateInputDto | 

try {
    final response = api.fareControllerUpdate(fareId, fareUpdateInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorFaresApi->fareControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fareId** | **String**|  | 
 **fareUpdateInputDto** | [**FareUpdateInputDto**](FareUpdateInputDto.md)|  | 

### Return type

[**FareResponseDtoOutput**](FareResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

