//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'auth_token_response_dto_output.g.dart';

/// AuthTokenResponseDtoOutput
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
abstract class AuthTokenResponseDtoOutput implements Built<AuthTokenResponseDtoOutput, AuthTokenResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'accessToken')
  String get accessToken;

  @BuiltValueField(wireName: r'tokenType')
  AuthTokenResponseDtoOutputTokenTypeEnum get tokenType;
  // enum tokenTypeEnum {  Bearer,  };

  @BuiltValueField(wireName: r'expiresIn')
  int get expiresIn;

  @BuiltValueField(wireName: r'scope')
  AuthTokenResponseDtoOutputScopeEnum get scope;
  // enum scopeEnum {  passenger,  operator,  platform,  };

  @BuiltValueField(wireName: r'role')
  String get role;

  @BuiltValueField(wireName: r'refreshToken')
  String get refreshToken;

  @BuiltValueField(wireName: r'refreshExpiresIn')
  int get refreshExpiresIn;

  AuthTokenResponseDtoOutput._();

  factory AuthTokenResponseDtoOutput([void updates(AuthTokenResponseDtoOutputBuilder b)]) = _$AuthTokenResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AuthTokenResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AuthTokenResponseDtoOutput> get serializer => _$AuthTokenResponseDtoOutputSerializer();
}

class _$AuthTokenResponseDtoOutputSerializer implements PrimitiveSerializer<AuthTokenResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [AuthTokenResponseDtoOutput, _$AuthTokenResponseDtoOutput];

  @override
  final String wireName = r'AuthTokenResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AuthTokenResponseDtoOutput object, {
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
      specifiedType: const FullType(AuthTokenResponseDtoOutputTokenTypeEnum),
    );
    yield r'expiresIn';
    yield serializers.serialize(
      object.expiresIn,
      specifiedType: const FullType(int),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(AuthTokenResponseDtoOutputScopeEnum),
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
    AuthTokenResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AuthTokenResponseDtoOutputBuilder result,
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
            specifiedType: const FullType(AuthTokenResponseDtoOutputTokenTypeEnum),
          ) as AuthTokenResponseDtoOutputTokenTypeEnum;
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
            specifiedType: const FullType(AuthTokenResponseDtoOutputScopeEnum),
          ) as AuthTokenResponseDtoOutputScopeEnum;
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
  AuthTokenResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AuthTokenResponseDtoOutputBuilder();
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


class AuthTokenResponseDtoOutputTokenTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'Bearer')
  static const AuthTokenResponseDtoOutputTokenTypeEnum bearer = _$authTokenResponseDtoOutputTokenTypeEnum_bearer;

  static Serializer<AuthTokenResponseDtoOutputTokenTypeEnum> get serializer => _$authTokenResponseDtoOutputTokenTypeEnumSerializer;

  const AuthTokenResponseDtoOutputTokenTypeEnum._(String name): super(name);

  static BuiltSet<AuthTokenResponseDtoOutputTokenTypeEnum> get values => _$authTokenResponseDtoOutputTokenTypeEnumValues;
  static AuthTokenResponseDtoOutputTokenTypeEnum valueOf(String name) => _$authTokenResponseDtoOutputTokenTypeEnumValueOf(name);
}

class AuthTokenResponseDtoOutputScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const AuthTokenResponseDtoOutputScopeEnum passenger = _$authTokenResponseDtoOutputScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const AuthTokenResponseDtoOutputScopeEnum operator_ = _$authTokenResponseDtoOutputScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const AuthTokenResponseDtoOutputScopeEnum platform = _$authTokenResponseDtoOutputScopeEnum_platform;

  static Serializer<AuthTokenResponseDtoOutputScopeEnum> get serializer => _$authTokenResponseDtoOutputScopeEnumSerializer;

  const AuthTokenResponseDtoOutputScopeEnum._(String name): super(name);

  static BuiltSet<AuthTokenResponseDtoOutputScopeEnum> get values => _$authTokenResponseDtoOutputScopeEnumValues;
  static AuthTokenResponseDtoOutputScopeEnum valueOf(String name) => _$authTokenResponseDtoOutputScopeEnumValueOf(name);
}

