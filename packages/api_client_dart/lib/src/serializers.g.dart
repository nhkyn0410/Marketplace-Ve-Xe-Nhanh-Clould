// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'serializers.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

Serializers _$serializers = (Serializers().toBuilder()
      ..add(AccountMutationResponseDtoOutput.serializer)
      ..add(AccountMutationResponseDtoOutputStatusEnum.serializer)
      ..add(AuthTokenResponseDtoOutput.serializer)
      ..add(AuthTokenResponseDtoOutputScopeEnum.serializer)
      ..add(AuthTokenResponseDtoOutputTokenTypeEnum.serializer)
      ..add(CredentialLoginDto.serializer)
      ..add(CredentialLoginResponseDtoOutput.serializer)
      ..add(CredentialTokenResponse.serializer)
      ..add(CredentialTokenResponseMfaRequiredEnum.serializer)
      ..add(CredentialTokenResponseScopeEnum.serializer)
      ..add(CredentialTokenResponseTokenTypeEnum.serializer)
      ..add(EmployeeAccountResponseDtoOutput.serializer)
      ..add(EmployeeAccountResponseDtoOutputRoleEnum.serializer)
      ..add(EmployeeAccountResponseDtoOutputStatusEnum.serializer)
      ..add(EmployeeCreateDto.serializer)
      ..add(EmployeeCreateDtoRoleEnum.serializer)
      ..add(EmployeeListResponseDtoOutput.serializer)
      ..add(EmployeeListResponseDtoOutputItemsInner.serializer)
      ..add(EmployeeListResponseDtoOutputItemsInnerRoleEnum.serializer)
      ..add(EmployeeListResponseDtoOutputItemsInnerStatusEnum.serializer)
      ..add(EmployeePasswordResetDto.serializer)
      ..add(EmployeeUpdateDto.serializer)
      ..add(EmployeeUpdateDtoRoleEnum.serializer)
      ..add(EmployeeUpdateDtoStatusEnum.serializer)
      ..add(HealthResponseDtoOutput.serializer)
      ..add(HealthResponseDtoOutputStatusEnum.serializer)
      ..add(MessageResponseDtoOutput.serializer)
      ..add(MessageResponseDtoOutputStatusEnum.serializer)
      ..add(MfaChallengeResponse.serializer)
      ..add(MfaChallengeResponseMfaRequiredEnum.serializer)
      ..add(MfaVerifyDto.serializer)
      ..add(MfaVerifyResponseDtoOutput.serializer)
      ..add(MfaVerifyResponseDtoOutputMfaRequiredEnum.serializer)
      ..add(MfaVerifyResponseDtoOutputScopeEnum.serializer)
      ..add(MfaVerifyResponseDtoOutputTokenTypeEnum.serializer)
      ..add(MongoHealthResponseDtoOutput.serializer)
      ..add(MongoHealthResponseDtoOutputServiceEnum.serializer)
      ..add(MongoHealthResponseDtoOutputStatusEnum.serializer)
      ..add(OAuthInitDto.serializer)
      ..add(OAuthRedirectResponseDtoOutput.serializer)
      ..add(OtpRequestDto.serializer)
      ..add(OtpVerifyDto.serializer)
      ..add(PasswordChangeChallengeResponse.serializer)
      ..add(
          PasswordChangeChallengeResponsePasswordChangeRequiredEnum.serializer)
      ..add(PasswordChangeRequiredDto.serializer)
      ..add(PostgresHealthResponseDtoOutput.serializer)
      ..add(PostgresHealthResponseDtoOutputServiceEnum.serializer)
      ..add(PostgresHealthResponseDtoOutputStatusEnum.serializer)
      ..add(ProblemDetailsDto.serializer)
      ..add(QueueHealthResponseDtoOutput.serializer)
      ..add(QueueHealthResponseDtoOutputQueuesInner.serializer)
      ..add(QueueHealthResponseDtoOutputStatusEnum.serializer)
      ..add(ReauthDto.serializer)
      ..add(RedisHealthResponseDtoOutput.serializer)
      ..add(RedisHealthResponseDtoOutputServiceEnum.serializer)
      ..add(RedisHealthResponseDtoOutputStatusEnum.serializer)
      ..add(RefreshTokenDto.serializer)
      ..add(RegisterDto.serializer)
      ..add(SessionListResponseDtoOutput.serializer)
      ..add(SessionListResponseDtoOutputItemsInner.serializer)
      ..addBuilderFactory(
          const FullType(BuiltList,
              const [const FullType(EmployeeListResponseDtoOutputItemsInner)]),
          () => ListBuilder<EmployeeListResponseDtoOutputItemsInner>())
      ..addBuilderFactory(
          const FullType(BuiltList,
              const [const FullType(QueueHealthResponseDtoOutputQueuesInner)]),
          () => ListBuilder<QueueHealthResponseDtoOutputQueuesInner>())
      ..addBuilderFactory(
          const FullType(BuiltList,
              const [const FullType(SessionListResponseDtoOutputItemsInner)]),
          () => ListBuilder<SessionListResponseDtoOutputItemsInner>())
      ..addBuilderFactory(
          const FullType(BuiltList, const [const FullType(String)]),
          () => ListBuilder<String>())
      ..addBuilderFactory(
          const FullType(
              BuiltMap, const [const FullType(String), const FullType(int)]),
          () => MapBuilder<String, int>()))
    .build();

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
