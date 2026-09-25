//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:api_client_dart/src/model/credential_token_response.dart';
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/mfa_challenge_response.dart';
import 'package:api_client_dart/src/model/password_change_challenge_response.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:one_of/any_of.dart';

part 'credential_login_response_dto_output.g.dart';

/// CredentialLoginResponseDtoOutput
///
/// Properties:
/// * [accessToken] 
/// * [tokenType] 
/// * [expiresIn] 
/// * [scope] 
/// * [role] 
/// * [refreshToken] 
/// * [refreshExpiresIn] 
/// * [mfaRequired] 
/// * [challengeToken] 
/// * [enrollmentRequired] 
/// * [challengeExpiresIn] 
/// * [otpAuthUri] 
/// * [passwordChangeRequired] 
/// * [passwordChangeToken] 
/// * [passwordChangeExpiresIn] 
@BuiltValue()
abstract class CredentialLoginResponseDtoOutput implements Built<CredentialLoginResponseDtoOutput, CredentialLoginResponseDtoOutputBuilder> {
  /// Any Of [CredentialTokenResponse], [MfaChallengeResponse], [PasswordChangeChallengeResponse]
  AnyOf get anyOf;

  CredentialLoginResponseDtoOutput._();

  factory CredentialLoginResponseDtoOutput([void updates(CredentialLoginResponseDtoOutputBuilder b)]) = _$CredentialLoginResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CredentialLoginResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CredentialLoginResponseDtoOutput> get serializer => _$CredentialLoginResponseDtoOutputSerializer();
}

class _$CredentialLoginResponseDtoOutputSerializer implements PrimitiveSerializer<CredentialLoginResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [CredentialLoginResponseDtoOutput, _$CredentialLoginResponseDtoOutput];

  @override
  final String wireName = r'CredentialLoginResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CredentialLoginResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
  }

  @override
  Object serialize(
    Serializers serializers,
    CredentialLoginResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final anyOf = object.anyOf;
    return serializers.serialize(anyOf, specifiedType: FullType(AnyOf, anyOf.types.map((type) => FullType(type)).toList()))!;
  }

  @override
  CredentialLoginResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CredentialLoginResponseDtoOutputBuilder();
    Object? anyOfDataSrc;
    final targetType = const FullType(AnyOf, [FullType(CredentialTokenResponse), FullType(MfaChallengeResponse), FullType(PasswordChangeChallengeResponse), ]);
    anyOfDataSrc = serialized;
    result.anyOf = serializers.deserialize(anyOfDataSrc, specifiedType: targetType) as AnyOf;
    return result.build();
  }
}


class CredentialLoginResponseDtoOutputTokenTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'Bearer')
  static const CredentialLoginResponseDtoOutputTokenTypeEnum bearer = _$credentialLoginResponseDtoOutputTokenTypeEnum_bearer;

  static Serializer<CredentialLoginResponseDtoOutputTokenTypeEnum> get serializer => _$credentialLoginResponseDtoOutputTokenTypeEnumSerializer;

  const CredentialLoginResponseDtoOutputTokenTypeEnum._(String name): super(name);

  static BuiltSet<CredentialLoginResponseDtoOutputTokenTypeEnum> get values => _$credentialLoginResponseDtoOutputTokenTypeEnumValues;
  static CredentialLoginResponseDtoOutputTokenTypeEnum valueOf(String name) => _$credentialLoginResponseDtoOutputTokenTypeEnumValueOf(name);
}

class CredentialLoginResponseDtoOutputScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const CredentialLoginResponseDtoOutputScopeEnum passenger = _$credentialLoginResponseDtoOutputScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const CredentialLoginResponseDtoOutputScopeEnum operator_ = _$credentialLoginResponseDtoOutputScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const CredentialLoginResponseDtoOutputScopeEnum platform = _$credentialLoginResponseDtoOutputScopeEnum_platform;

  static Serializer<CredentialLoginResponseDtoOutputScopeEnum> get serializer => _$credentialLoginResponseDtoOutputScopeEnumSerializer;

  const CredentialLoginResponseDtoOutputScopeEnum._(String name): super(name);

  static BuiltSet<CredentialLoginResponseDtoOutputScopeEnum> get values => _$credentialLoginResponseDtoOutputScopeEnumValues;
  static CredentialLoginResponseDtoOutputScopeEnum valueOf(String name) => _$credentialLoginResponseDtoOutputScopeEnumValueOf(name);
}

class CredentialLoginResponseDtoOutputMfaRequiredEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const CredentialLoginResponseDtoOutputMfaRequiredEnum true_ = _$credentialLoginResponseDtoOutputMfaRequiredEnum_true_;

  static Serializer<CredentialLoginResponseDtoOutputMfaRequiredEnum> get serializer => _$credentialLoginResponseDtoOutputMfaRequiredEnumSerializer;

  const CredentialLoginResponseDtoOutputMfaRequiredEnum._(String name): super(name);

  static BuiltSet<CredentialLoginResponseDtoOutputMfaRequiredEnum> get values => _$credentialLoginResponseDtoOutputMfaRequiredEnumValues;
  static CredentialLoginResponseDtoOutputMfaRequiredEnum valueOf(String name) => _$credentialLoginResponseDtoOutputMfaRequiredEnumValueOf(name);
}

class CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum true_ = _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnum_true_;

  static Serializer<CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum> get serializer => _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnumSerializer;

  const CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum._(String name): super(name);

  static BuiltSet<CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum> get values => _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnumValues;
  static CredentialLoginResponseDtoOutputPasswordChangeRequiredEnum valueOf(String name) => _$credentialLoginResponseDtoOutputPasswordChangeRequiredEnumValueOf(name);
}

