//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:api_client_dart/src/model/refresh_token_pair_response.dart';
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/refresh_web_session_response.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:one_of/any_of.dart';

part 'refresh_response_dto_output.g.dart';

/// RefreshResponseDtoOutput
///
/// Properties:
/// * [accessToken] 
/// * [tokenType] 
/// * [expiresIn] 
/// * [scope] 
/// * [role] 
/// * [refreshToken] 
/// * [refreshExpiresIn] 
/// * [authenticated] 
@BuiltValue()
abstract class RefreshResponseDtoOutput implements Built<RefreshResponseDtoOutput, RefreshResponseDtoOutputBuilder> {
  /// Any Of [RefreshTokenPairResponse], [RefreshWebSessionResponse]
  AnyOf get anyOf;

  RefreshResponseDtoOutput._();

  factory RefreshResponseDtoOutput([void updates(RefreshResponseDtoOutputBuilder b)]) = _$RefreshResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RefreshResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RefreshResponseDtoOutput> get serializer => _$RefreshResponseDtoOutputSerializer();
}

class _$RefreshResponseDtoOutputSerializer implements PrimitiveSerializer<RefreshResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [RefreshResponseDtoOutput, _$RefreshResponseDtoOutput];

  @override
  final String wireName = r'RefreshResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RefreshResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
  }

  @override
  Object serialize(
    Serializers serializers,
    RefreshResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final anyOf = object.anyOf;
    return serializers.serialize(anyOf, specifiedType: FullType(AnyOf, anyOf.types.map((type) => FullType(type)).toList()))!;
  }

  @override
  RefreshResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RefreshResponseDtoOutputBuilder();
    Object? anyOfDataSrc;
    final targetType = const FullType(AnyOf, [FullType(RefreshTokenPairResponse), FullType(RefreshWebSessionResponse), ]);
    anyOfDataSrc = serialized;
    result.anyOf = serializers.deserialize(anyOfDataSrc, specifiedType: targetType) as AnyOf;
    return result.build();
  }
}


class RefreshResponseDtoOutputTokenTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'Bearer')
  static const RefreshResponseDtoOutputTokenTypeEnum bearer = _$refreshResponseDtoOutputTokenTypeEnum_bearer;

  static Serializer<RefreshResponseDtoOutputTokenTypeEnum> get serializer => _$refreshResponseDtoOutputTokenTypeEnumSerializer;

  const RefreshResponseDtoOutputTokenTypeEnum._(String name): super(name);

  static BuiltSet<RefreshResponseDtoOutputTokenTypeEnum> get values => _$refreshResponseDtoOutputTokenTypeEnumValues;
  static RefreshResponseDtoOutputTokenTypeEnum valueOf(String name) => _$refreshResponseDtoOutputTokenTypeEnumValueOf(name);
}

class RefreshResponseDtoOutputScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const RefreshResponseDtoOutputScopeEnum passenger = _$refreshResponseDtoOutputScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const RefreshResponseDtoOutputScopeEnum operator_ = _$refreshResponseDtoOutputScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const RefreshResponseDtoOutputScopeEnum platform = _$refreshResponseDtoOutputScopeEnum_platform;

  static Serializer<RefreshResponseDtoOutputScopeEnum> get serializer => _$refreshResponseDtoOutputScopeEnumSerializer;

  const RefreshResponseDtoOutputScopeEnum._(String name): super(name);

  static BuiltSet<RefreshResponseDtoOutputScopeEnum> get values => _$refreshResponseDtoOutputScopeEnumValues;
  static RefreshResponseDtoOutputScopeEnum valueOf(String name) => _$refreshResponseDtoOutputScopeEnumValueOf(name);
}

class RefreshResponseDtoOutputAuthenticatedEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const RefreshResponseDtoOutputAuthenticatedEnum true_ = _$refreshResponseDtoOutputAuthenticatedEnum_true_;

  static Serializer<RefreshResponseDtoOutputAuthenticatedEnum> get serializer => _$refreshResponseDtoOutputAuthenticatedEnumSerializer;

  const RefreshResponseDtoOutputAuthenticatedEnum._(String name): super(name);

  static BuiltSet<RefreshResponseDtoOutputAuthenticatedEnum> get values => _$refreshResponseDtoOutputAuthenticatedEnumValues;
  static RefreshResponseDtoOutputAuthenticatedEnum valueOf(String name) => _$refreshResponseDtoOutputAuthenticatedEnumValueOf(name);
}

