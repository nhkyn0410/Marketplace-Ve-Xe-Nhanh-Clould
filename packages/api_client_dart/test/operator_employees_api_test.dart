import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for OperatorEmployeesApi
void main() {
  final instance = ApiClientDart().getOperatorEmployeesApi();

  group(OperatorEmployeesApi, () {
    //Future<EmployeeAccountResponseDtoOutput> employeeAccountControllerCreate(EmployeeCreateDto employeeCreateDto) async
    test('test employeeAccountControllerCreate', () async {
      // TODO
    });

    //Future<EmployeeListResponseDtoOutput> employeeAccountControllerList({ String cursor, num limit }) async
    test('test employeeAccountControllerList', () async {
      // TODO
    });

    //Future<AccountMutationResponseDtoOutput> employeeAccountControllerResetPassword(String employeeId, EmployeePasswordResetDto employeePasswordResetDto) async
    test('test employeeAccountControllerResetPassword', () async {
      // TODO
    });

    //Future<EmployeeAccountResponseDtoOutput> employeeAccountControllerUpdate(String employeeId, EmployeeUpdateDto employeeUpdateDto) async
    test('test employeeAccountControllerUpdate', () async {
      // TODO
    });

  });
}
