//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'refresh_token_pair_response.g.dart';

/// RefreshTokenPairResponse
///
/// Properties:
/// * [accessToken] 
/// * [tokenType] 
/// * [expiresIn] 
/// * [scope] 
/// * [role] 
/// * [refreshToken] 
/// * [refreshExpiresIn] 
@BuiltValue()
abstract class RefreshTokenPairResponse implements Built<RefreshTokenPairResponse, RefreshTokenPairResponseBuilder> {
  @BuiltValueField(wireName: r'accessToken')
  String get accessToken;

  @BuiltValueField(wireName: r'tokenType')
  RefreshTokenPairResponseTokenTypeEnum get tokenType;
  // enum tokenTypeEnum {  Bearer,  };

  @BuiltValueField(wireName: r'expiresIn')
  int get expiresIn;

  @BuiltValueField(wireName: r'scope')
  RefreshTokenPairResponseScopeEnum get scope;
  // enum scopeEnum {  passenger,  operator,  platform,  };

  @BuiltValueField(wireName: r'role')
  String get role;

  @BuiltValueField(wireName: r'refreshToken')
  String get refreshToken;

  @BuiltValueField(wireName: r'refreshExpiresIn')
  int get refreshExpiresIn;

  RefreshTokenPairResponse._();

  factory RefreshTokenPairResponse([void updates(RefreshTokenPairResponseBuilder b)]) = _$RefreshTokenPairResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RefreshTokenPairResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RefreshTokenPairResponse> get serializer => _$RefreshTokenPairResponseSerializer();
}

class _$RefreshTokenPairResponseSerializer implements PrimitiveSerializer<RefreshTokenPairResponse> {
  @override
  final Iterable<Type> types = const [RefreshTokenPairResponse, _$RefreshTokenPairResponse];

  @override
  final String wireName = r'RefreshTokenPairResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RefreshTokenPairResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'accessToken';
    yield serializers.serialize(
      object.accessToken,
      specifiedType: const FullType(String),
    );
    yield r'tokenType';
    yield serializers.serialize(
      object.tokenType,
      specifiedType: const FullType(RefreshTokenPairResponseTokenTypeEnum),
    );
    yield r'expiresIn';
    yield serializers.serialize(
      object.expiresIn,
      specifiedType: const FullType(int),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(RefreshTokenPairResponseScopeEnum),
    );
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(String),
    );
    yield r'refreshToken';
    yield serializers.serialize(
      object.refreshToken,
      specifiedType: const FullType(String),
    );
    yield r'refreshExpiresIn';
    yield serializers.serialize(
      object.refreshExpiresIn,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RefreshTokenPairResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RefreshTokenPairResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'accessToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.accessToken = valueDes;
          break;
        case r'tokenType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RefreshTokenPairResponseTokenTypeEnum),
          ) as RefreshTokenPairResponseTokenTypeEnum;
          result.tokenType = valueDes;
          break;
        case r'expiresIn':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expiresIn = valueDes;
          break;
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RefreshTokenPairResponseScopeEnum),
          ) as RefreshTokenPairResponseScopeEnum;
          result.scope = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.role = valueDes;
          break;
        case r'refreshToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.refreshToken = valueDes;
          break;
        case r'refreshExpiresIn':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.refreshExpiresIn = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RefreshTokenPairResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RefreshTokenPairResponseBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


class RefreshTokenPairResponseTokenTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'Bearer')
  static const RefreshTokenPairResponseTokenTypeEnum bearer = _$refreshTokenPairResponseTokenTypeEnum_bearer;

  static Serializer<RefreshTokenPairResponseTokenTypeEnum> get serializer => _$refreshTokenPairResponseTokenTypeEnumSerializer;

  const RefreshTokenPairResponseTokenTypeEnum._(String name): super(name);

  static BuiltSet<RefreshTokenPairResponseTokenTypeEnum> get values => _$refreshTokenPairResponseTokenTypeEnumValues;
  static RefreshTokenPairResponseTokenTypeEnum valueOf(String name) => _$refreshTokenPairResponseTokenTypeEnumValueOf(name);
}

class RefreshTokenPairResponseScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const RefreshTokenPairResponseScopeEnum passenger = _$refreshTokenPairResponseScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const RefreshTokenPairResponseScopeEnum operator_ = _$refreshTokenPairResponseScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const RefreshTokenPairResponseScopeEnum platform = _$refreshTokenPairResponseScopeEnum_platform;

  static Serializer<RefreshTokenPairResponseScopeEnum> get serializer => _$refreshTokenPairResponseScopeEnumSerializer;

  const RefreshTokenPairResponseScopeEnum._(String name): super(name);

  static BuiltSet<RefreshTokenPairResponseScopeEnum> get values => _$refreshTokenPairResponseScopeEnumValues;
  static RefreshTokenPairResponseScopeEnum valueOf(String name) => _$refreshTokenPairResponseScopeEnumValueOf(name);
}

