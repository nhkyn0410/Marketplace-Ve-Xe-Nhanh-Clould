# api_client_dart.api.OperatorTripsApi

## Load the API package
```dart
import 'package:api_client_dart/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**tripControllerCreate**](OperatorTripsApi.md#tripcontrollercreate) | **POST** /v1/operator/trips | 
[**tripControllerGet**](OperatorTripsApi.md#tripcontrollerget) | **GET** /v1/operator/trips/{tripId} | 
[**tripControllerList**](OperatorTripsApi.md#tripcontrollerlist) | **GET** /v1/operator/trips | 
[**tripControllerUpdate**](OperatorTripsApi.md#tripcontrollerupdate) | **PUT** /v1/operator/trips/{tripId} | 


# **tripControllerCreate**
> TripResponseDtoOutput tripControllerCreate(tripInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorTripsApi();
final TripInputDto tripInputDto = ; // TripInputDto | 

try {
    final response = api.tripControllerCreate(tripInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorTripsApi->tripControllerCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tripInputDto** | [**TripInputDto**](TripInputDto.md)|  | 

### Return type

[**TripResponseDtoOutput**](TripResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tripControllerGet**
> TripResponseDtoOutput tripControllerGet(tripId)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorTripsApi();
final String tripId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.tripControllerGet(tripId);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorTripsApi->tripControllerGet: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tripId** | **String**|  | 

### Return type

[**TripResponseDtoOutput**](TripResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tripControllerList**
> TripListResponseDtoOutput tripControllerList(routeId, vehicleId, status, departureFrom, departureTo, cursor, limit)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorTripsApi();
final String routeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String vehicleId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String status = status_example; // String | 
final DateTime departureFrom = 2013-10-20T19:20:30+01:00; // DateTime | 
final DateTime departureTo = 2013-10-20T19:20:30+01:00; // DateTime | 
final String cursor = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final num limit = 8.14; // num | 

try {
    final response = api.tripControllerList(routeId, vehicleId, status, departureFrom, departureTo, cursor, limit);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorTripsApi->tripControllerList: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **routeId** | **String**|  | [optional] 
 **vehicleId** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 
 **departureFrom** | **DateTime**|  | [optional] 
 **departureTo** | **DateTime**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **num**|  | [optional] [default to 20]

### Return type

[**TripListResponseDtoOutput**](TripListResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tripControllerUpdate**
> TripResponseDtoOutput tripControllerUpdate(tripId, tripInputDto)



### Example
```dart
import 'package:api_client_dart/api.dart';

final api = ApiClientDart().getOperatorTripsApi();
final String tripId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final TripInputDto tripInputDto = ; // TripInputDto | 

try {
    final response = api.tripControllerUpdate(tripId, tripInputDto);
    print(response);
} on DioException catch (e) {
    print('Exception when calling OperatorTripsApi->tripControllerUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tripId** | **String**|  | 
 **tripInputDto** | [**TripInputDto**](TripInputDto.md)|  | 

### Return type

[**TripResponseDtoOutput**](TripResponseDtoOutput.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

