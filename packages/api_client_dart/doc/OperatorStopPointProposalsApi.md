# api_client_dart.api.OperatorStopPointProposalsApi

## Load the API package
```dart
import 'package:api_client_dart/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**stopPointProposalControllerCreate**](OperatorStopPointProposalsApi.md#stoppointproposalcontrollercreate) | **POST** /v1/operator/stop-point-proposals | 
[**stopPointProposalControllerList**](OperatorStopPointProposalsApi.md#stoppointproposalcontrollerlist) | **GET** /v1/operator/stop-point-proposals | 
[**stopPointProposalControllerResubmit**](OperatorStopPointProposalsApi.md#stoppointproposalcontrollerresubmit) | **PUT** /v1/operator/stop-point-proposals/{proposalId} | 


# **stopPointProposalControllerCreate**
> StopPointProposalResponseDtoOutput stopPointProposalControllerCreate(stopPointProposalInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorStopPointProposalsApi();
final StopPointProposalInputDto stopPointProposalInputDto = ; // StopPointProposalInputDto | 

try {
    final response = api.stopPointProposalControllerCreate(stopPointProposalInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorStopPointProposalsApi->stopPointProposalControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **stopPointProposalInputDto** | [**StopPointProposalInputDto**](StopPointProposalInputDto.md)|  | 

### Return type

[**StopPointProposalResponseDtoOutput**](StopPointProposalResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **stopPointProposalControllerList**
> StopPointProposalListResponseDtoOutput stopPointProposalControllerList(status, cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorStopPointProposalsApi();
final String status = status_example; // String | 
final String cursor = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final num limit = 8.14; // num | 

try {
    final response = api.stopPointProposalControllerList(status, cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorStopPointProposalsApi->stopPointProposalControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**StopPointProposalListResponseDtoOutput**](StopPointProposalListResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **stopPointProposalControllerResubmit**
> StopPointProposalResponseDtoOutput stopPointProposalControllerResubmit(proposalId, stopPointProposalInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorStopPointProposalsApi();
final String proposalId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final StopPointProposalInputDto stopPointProposalInputDto = ; // StopPointProposalInputDto | 

try {
    final response = api.stopPointProposalControllerResubmit(proposalId, stopPointProposalInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorStopPointProposalsApi->stopPointProposalControllerResubmit: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **proposalId** | **String**|  | 
 **stopPointProposalInputDto** | [**StopPointProposalInputDto**](StopPointProposalInputDto.md)|  | 

### Return type

[**StopPointProposalResponseDtoOutput**](StopPointProposalResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

