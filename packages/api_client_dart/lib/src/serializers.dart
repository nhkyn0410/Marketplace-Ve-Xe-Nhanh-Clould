//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_import

import 'package:one_of_serializer/any_of_serializer.dart';
import 'package:one_of_serializer/one_of_serializer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart';
import 'package:built_value/iso_8601_date_time_serializer.dart';
import 'package:api_client_dart/src/date_serializer.dart';
import 'package:api_client_dart/src/model/date.dart';

import 'package:api_client_dart/src/model/account_mutation_response_dto_output.dart';
import 'package:api_client_dart/src/model/auth_token_response_dto_output.dart';
import 'package:api_client_dart/src/model/credential_login_dto.dart';
import 'package:api_client_dart/src/model/credential_login_response_dto_output.dart';
import 'package:api_client_dart/src/model/credential_token_response.dart';
import 'package:api_client_dart/src/model/employee_account_response_dto_output.dart';
import 'package:api_client_dart/src/model/employee_create_dto.dart';
import 'package:api_client_dart/src/model/employee_list_response_dto_output.dart';
import 'package:api_client_dart/src/model/employee_list_response_dto_output_items_inner.dart';
import 'package:api_client_dart/src/model/employee_password_reset_dto.dart';
import 'package:api_client_dart/src/model/employee_update_dto.dart';
import 'package:api_client_dart/src/model/health_response_dto_output.dart';
import 'package:api_client_dart/src/model/message_response_dto_output.dart';
import 'package:api_client_dart/src/model/mfa_challenge_response.dart';
import 'package:api_client_dart/src/model/mfa_verify_dto.dart';
import 'package:api_client_dart/src/model/mfa_verify_response_dto_output.dart';
import 'package:api_client_dart/src/model/mongo_health_response_dto_output.dart';
import 'package:api_client_dart/src/model/o_auth_init_dto.dart';
import 'package:api_client_dart/src/model/o_auth_redirect_response_dto_output.dart';
import 'package:api_client_dart/src/model/otp_request_dto.dart';
import 'package:api_client_dart/src/model/otp_verify_dto.dart';
import 'package:api_client_dart/src/model/password_change_challenge_response.dart';
import 'package:api_client_dart/src/model/password_change_required_dto.dart';
import 'package:api_client_dart/src/model/postgres_health_response_dto_output.dart';
import 'package:api_client_dart/src/model/problem_details_dto.dart';
import 'package:api_client_dart/src/model/queue_health_response_dto_output.dart';
import 'package:api_client_dart/src/model/queue_health_response_dto_output_queues_inner.dart';
import 'package:api_client_dart/src/model/reauth_dto.dart';
import 'package:api_client_dart/src/model/redis_health_response_dto_output.dart';
import 'package:api_client_dart/src/model/refresh_token_dto.dart';
import 'package:api_client_dart/src/model/register_dto.dart';
import 'package:api_client_dart/src/model/session_list_response_dto_output.dart';
import 'package:api_client_dart/src/model/session_list_response_dto_output_items_inner.dart';

part 'serializers.g.dart';

@SerializersFor([
  AccountMutationResponseDtoOutput,
  AuthTokenResponseDtoOutput,
  CredentialLoginDto,
  CredentialLoginResponseDtoOutput,
  CredentialTokenResponse,
  EmployeeAccountResponseDtoOutput,
  EmployeeCreateDto,
  EmployeeListResponseDtoOutput,
  EmployeeListResponseDtoOutputItemsInner,
  EmployeePasswordResetDto,
  EmployeeUpdateDto,
  HealthResponseDtoOutput,
  MessageResponseDtoOutput,
  MfaChallengeResponse,
  MfaVerifyDto,
  MfaVerifyResponseDtoOutput,
  MongoHealthResponseDtoOutput,
  OAuthInitDto,
  OAuthRedirectResponseDtoOutput,
  OtpRequestDto,
  OtpVerifyDto,
  PasswordChangeChallengeResponse,
  PasswordChangeRequiredDto,
  PostgresHealthResponseDtoOutput,
  ProblemDetailsDto,
  QueueHealthResponseDtoOutput,
  QueueHealthResponseDtoOutputQueuesInner,
  ReauthDto,
  RedisHealthResponseDtoOutput,
  RefreshTokenDto,
  RegisterDto,
  SessionListResponseDtoOutput,
  SessionListResponseDtoOutputItemsInner,
])
Serializers serializers = (_$serializers.toBuilder()
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(SessionListResponseDtoOutputItemsInner)]),
        () => ListBuilder<SessionListResponseDtoOutputItemsInner>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(EmployeeListResponseDtoOutputItemsInner)]),
        () => ListBuilder<EmployeeListResponseDtoOutputItemsInner>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltMap, [FullType(String), FullType(int)]),
        () => MapBuilder<String, int>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(QueueHealthResponseDtoOutputQueuesInner)]),
        () => ListBuilder<QueueHealthResponseDtoOutputQueuesInner>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(String)]),
        () => ListBuilder<String>(),
      )
      ..add(const OneOfSerializer())
      ..add(const AnyOfSerializer())
      ..add(const DateSerializer())
      ..add(Iso8601DateTimeSerializer())
    ).build();

Serializers standardSerializers =
    (serializers.toBuilder()..addPlugin(StandardJsonPlugin())).build();
