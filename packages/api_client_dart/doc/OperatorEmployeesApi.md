# api_client_dart.api.OperatorEmployeesApi

## Load the API package
```dart
import 'package:api_client_dart/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**employeeAccountControllerCreate**](OperatorEmployeesApi.md#employeeaccountcontrollercreate) | **POST** /v1/operator/employees | 
[**employeeAccountControllerList**](OperatorEmployeesApi.md#employeeaccountcontrollerlist) | **GET** /v1/operator/employees | 
[**employeeAccountControllerResetPassword**](OperatorEmployeesApi.md#employeeaccountcontrollerresetpassword) | **POST** /v1/operator/employees/{employeeId}/password-reset | 
[**employeeAccountControllerUpdate**](OperatorEmployeesApi.md#employeeaccountcontrollerupdate) | **PATCH** /v1/operator/employees/{employeeId} | 


# **employeeAccountControllerCreate**
> EmployeeAccountResponseDtoOutput employeeAccountControllerCreate(employeeCreateDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorEmployeesApi();
final EmployeeCreateDto employeeCreateDto = ; // EmployeeCreateDto | 

try {
    final response = api.employeeAccountControllerCreate(employeeCreateDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorEmployeesApi->employeeAccountControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **employeeCreateDto** | [**EmployeeCreateDto**](EmployeeCreateDto.md)|  | 

### Return type

[**EmployeeAccountResponseDtoOutput**](EmployeeAccountResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **employeeAccountControllerList**
> EmployeeListResponseDtoOutput employeeAccountControllerList(cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorEmployeesApi();
final String cursor = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final num limit = 8.14; // num | 

try {
    final response = api.employeeAccountControllerList(cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorEmployeesApi->employeeAccountControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | **String**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**EmployeeListResponseDtoOutput**](EmployeeListResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **employeeAccountControllerResetPassword**
> AccountMutationResponseDtoOutput employeeAccountControllerResetPassword(employeeId, employeePasswordResetDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorEmployeesApi();
final String employeeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final EmployeePasswordResetDto employeePasswordResetDto = ; // EmployeePasswordResetDto | 

try {
    final response = api.employeeAccountControllerResetPassword(employeeId, employeePasswordResetDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorEmployeesApi->employeeAccountControllerResetPassword: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **employeeId** | **String**|  | 
 **employeePasswordResetDto** | [**EmployeePasswordResetDto**](EmployeePasswordResetDto.md)|  | 

### Return type

[**AccountMutationResponseDtoOutput**](AccountMutationResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **employeeAccountControllerUpdate**
> EmployeeAccountResponseDtoOutput employeeAccountControllerUpdate(employeeId, employeeUpdateDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorEmployeesApi();
final String employeeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final EmployeeUpdateDto employeeUpdateDto = ; // EmployeeUpdateDto | 

try {
    final response = api.employeeAccountControllerUpdate(employeeId, employeeUpdateDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorEmployeesApi->employeeAccountControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **employeeId** | **String**|  | 
 **employeeUpdateDto** | [**EmployeeUpdateDto**](EmployeeUpdateDto.md)|  | 

### Return type

[**EmployeeAccountResponseDtoOutput**](EmployeeAccountResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

