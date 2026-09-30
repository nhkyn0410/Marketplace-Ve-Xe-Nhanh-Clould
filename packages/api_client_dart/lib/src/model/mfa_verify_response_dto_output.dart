//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:api_client_dart/src/model/mfa_verify_web_session_response.dart';
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/mfa_verify_token_response.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:one_of/any_of.dart';

part 'mfa_verify_response_dto_output.g.dart';

/// MfaVerifyResponseDtoOutput
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
/// * [backupCodes] 
/// * [authenticated] 
@BuiltValue()
abstract class MfaVerifyResponseDtoOutput implements Built<MfaVerifyResponseDtoOutput, MfaVerifyResponseDtoOutputBuilder> {
  /// Any Of [MfaVerifyTokenResponse], [MfaVerifyWebSessionResponse]
  AnyOf get anyOf;

  MfaVerifyResponseDtoOutput._();

  factory MfaVerifyResponseDtoOutput([void updates(MfaVerifyResponseDtoOutputBuilder b)]) = _$MfaVerifyResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MfaVerifyResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MfaVerifyResponseDtoOutput> get serializer => _$MfaVerifyResponseDtoOutputSerializer();
}

class _$MfaVerifyResponseDtoOutputSerializer implements PrimitiveSerializer<MfaVerifyResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [MfaVerifyResponseDtoOutput, _$MfaVerifyResponseDtoOutput];

  @override
  final String wireName = r'MfaVerifyResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MfaVerifyResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
  }

  @override
  Object serialize(
    Serializers serializers,
    MfaVerifyResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final anyOf = object.anyOf;
    return serializers.serialize(anyOf, specifiedType: FullType(AnyOf, anyOf.types.map((type) => FullType(type)).toList()))!;
  }

  @override
  MfaVerifyResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MfaVerifyResponseDtoOutputBuilder();
    Object? anyOfDataSrc;
    final targetType = const FullType(AnyOf, [FullType(MfaVerifyTokenResponse), FullType(MfaVerifyWebSessionResponse), ]);
    anyOfDataSrc = serialized;
    result.anyOf = serializers.deserialize(anyOfDataSrc, specifiedType: targetType) as AnyOf;
    return result.build();
  }
}


class MfaVerifyResponseDtoOutputTokenTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'Bearer')
  static const MfaVerifyResponseDtoOutputTokenTypeEnum bearer = _$mfaVerifyResponseDtoOutputTokenTypeEnum_bearer;

  static Serializer<MfaVerifyResponseDtoOutputTokenTypeEnum> get serializer => _$mfaVerifyResponseDtoOutputTokenTypeEnumSerializer;

  const MfaVerifyResponseDtoOutputTokenTypeEnum._(String name): super(name);

  static BuiltSet<MfaVerifyResponseDtoOutputTokenTypeEnum> get values => _$mfaVerifyResponseDtoOutputTokenTypeEnumValues;
  static MfaVerifyResponseDtoOutputTokenTypeEnum valueOf(String name) => _$mfaVerifyResponseDtoOutputTokenTypeEnumValueOf(name);
}

class MfaVerifyResponseDtoOutputScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const MfaVerifyResponseDtoOutputScopeEnum passenger = _$mfaVerifyResponseDtoOutputScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const MfaVerifyResponseDtoOutputScopeEnum operator_ = _$mfaVerifyResponseDtoOutputScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const MfaVerifyResponseDtoOutputScopeEnum platform = _$mfaVerifyResponseDtoOutputScopeEnum_platform;

  static Serializer<MfaVerifyResponseDtoOutputScopeEnum> get serializer => _$mfaVerifyResponseDtoOutputScopeEnumSerializer;

  const MfaVerifyResponseDtoOutputScopeEnum._(String name): super(name);

  static BuiltSet<MfaVerifyResponseDtoOutputScopeEnum> get values => _$mfaVerifyResponseDtoOutputScopeEnumValues;
  static MfaVerifyResponseDtoOutputScopeEnum valueOf(String name) => _$mfaVerifyResponseDtoOutputScopeEnumValueOf(name);
}

class MfaVerifyResponseDtoOutputMfaRequiredEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'false')
  static const MfaVerifyResponseDtoOutputMfaRequiredEnum false_ = _$mfaVerifyResponseDtoOutputMfaRequiredEnum_false_;

  static Serializer<MfaVerifyResponseDtoOutputMfaRequiredEnum> get serializer => _$mfaVerifyResponseDtoOutputMfaRequiredEnumSerializer;

  const MfaVerifyResponseDtoOutputMfaRequiredEnum._(String name): super(name);

  static BuiltSet<MfaVerifyResponseDtoOutputMfaRequiredEnum> get values => _$mfaVerifyResponseDtoOutputMfaRequiredEnumValues;
  static MfaVerifyResponseDtoOutputMfaRequiredEnum valueOf(String name) => _$mfaVerifyResponseDtoOutputMfaRequiredEnumValueOf(name);
}

class MfaVerifyResponseDtoOutputAuthenticatedEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const MfaVerifyResponseDtoOutputAuthenticatedEnum true_ = _$mfaVerifyResponseDtoOutputAuthenticatedEnum_true_;

  static Serializer<MfaVerifyResponseDtoOutputAuthenticatedEnum> get serializer => _$mfaVerifyResponseDtoOutputAuthenticatedEnumSerializer;

  const MfaVerifyResponseDtoOutputAuthenticatedEnum._(String name): super(name);

  static BuiltSet<MfaVerifyResponseDtoOutputAuthenticatedEnum> get values => _$mfaVerifyResponseDtoOutputAuthenticatedEnumValues;
  static MfaVerifyResponseDtoOutputAuthenticatedEnum valueOf(String name) => _$mfaVerifyResponseDtoOutputAuthenticatedEnumValueOf(name);
}

