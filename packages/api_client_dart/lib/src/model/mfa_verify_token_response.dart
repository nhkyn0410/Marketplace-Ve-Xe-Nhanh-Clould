//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'mfa_verify_token_response.g.dart';

/// MfaVerifyTokenResponse
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
@BuiltValue()
abstract class MfaVerifyTokenResponse implements Built<MfaVerifyTokenResponse, MfaVerifyTokenResponseBuilder> {
  @BuiltValueField(wireName: r'accessToken')
  String get accessToken;

  @BuiltValueField(wireName: r'tokenType')
  MfaVerifyTokenResponseTokenTypeEnum get tokenType;
  // enum tokenTypeEnum {  Bearer,  };

  @BuiltValueField(wireName: r'expiresIn')
  int get expiresIn;

  @BuiltValueField(wireName: r'scope')
  MfaVerifyTokenResponseScopeEnum get scope;
  // enum scopeEnum {  passenger,  operator,  platform,  };

  @BuiltValueField(wireName: r'role')
  String get role;

  @BuiltValueField(wireName: r'refreshToken')
  String get refreshToken;

  @BuiltValueField(wireName: r'refreshExpiresIn')
  int get refreshExpiresIn;

  @BuiltValueField(wireName: r'mfaRequired')
  MfaVerifyTokenResponseMfaRequiredEnum get mfaRequired;
  // enum mfaRequiredEnum {  false,  };

  @BuiltValueField(wireName: r'backupCodes')
  BuiltList<String>? get backupCodes;

  MfaVerifyTokenResponse._();

  factory MfaVerifyTokenResponse([void updates(MfaVerifyTokenResponseBuilder b)]) = _$MfaVerifyTokenResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MfaVerifyTokenResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MfaVerifyTokenResponse> get serializer => _$MfaVerifyTokenResponseSerializer();
}

class _$MfaVerifyTokenResponseSerializer implements PrimitiveSerializer<MfaVerifyTokenResponse> {
  @override
  final Iterable<Type> types = const [MfaVerifyTokenResponse, _$MfaVerifyTokenResponse];

  @override
  final String wireName = r'MfaVerifyTokenResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MfaVerifyTokenResponse object, {
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
      specifiedType: const FullType(MfaVerifyTokenResponseTokenTypeEnum),
    );
    yield r'expiresIn';
    yield serializers.serialize(
      object.expiresIn,
      specifiedType: const FullType(int),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(MfaVerifyTokenResponseScopeEnum),
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
    yield r'mfaRequired';
    yield serializers.serialize(
      object.mfaRequired,
      specifiedType: const FullType(MfaVerifyTokenResponseMfaRequiredEnum),
    );
    if (object.backupCodes != null) {
      yield r'backupCodes';
      yield serializers.serialize(
        object.backupCodes,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    MfaVerifyTokenResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MfaVerifyTokenResponseBuilder result,
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
            specifiedType: const FullType(MfaVerifyTokenResponseTokenTypeEnum),
          ) as MfaVerifyTokenResponseTokenTypeEnum;
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
            specifiedType: const FullType(MfaVerifyTokenResponseScopeEnum),
          ) as MfaVerifyTokenResponseScopeEnum;
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
        case r'mfaRequired':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MfaVerifyTokenResponseMfaRequiredEnum),
          ) as MfaVerifyTokenResponseMfaRequiredEnum;
          result.mfaRequired = valueDes;
          break;
        case r'backupCodes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BuiltList, [FullType(String)]),
          ) as BuiltList<String>?;
          if (valueDes == null) continue;
          result.backupCodes.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MfaVerifyTokenResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MfaVerifyTokenResponseBuilder();
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


class MfaVerifyTokenResponseTokenTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'Bearer')
  static const MfaVerifyTokenResponseTokenTypeEnum bearer = _$mfaVerifyTokenResponseTokenTypeEnum_bearer;

  static Serializer<MfaVerifyTokenResponseTokenTypeEnum> get serializer => _$mfaVerifyTokenResponseTokenTypeEnumSerializer;

  const MfaVerifyTokenResponseTokenTypeEnum._(String name): super(name);

  static BuiltSet<MfaVerifyTokenResponseTokenTypeEnum> get values => _$mfaVerifyTokenResponseTokenTypeEnumValues;
  static MfaVerifyTokenResponseTokenTypeEnum valueOf(String name) => _$mfaVerifyTokenResponseTokenTypeEnumValueOf(name);
}

class MfaVerifyTokenResponseScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const MfaVerifyTokenResponseScopeEnum passenger = _$mfaVerifyTokenResponseScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const MfaVerifyTokenResponseScopeEnum operator_ = _$mfaVerifyTokenResponseScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const MfaVerifyTokenResponseScopeEnum platform = _$mfaVerifyTokenResponseScopeEnum_platform;

  static Serializer<MfaVerifyTokenResponseScopeEnum> get serializer => _$mfaVerifyTokenResponseScopeEnumSerializer;

  const MfaVerifyTokenResponseScopeEnum._(String name): super(name);

  static BuiltSet<MfaVerifyTokenResponseScopeEnum> get values => _$mfaVerifyTokenResponseScopeEnumValues;
  static MfaVerifyTokenResponseScopeEnum valueOf(String name) => _$mfaVerifyTokenResponseScopeEnumValueOf(name);
}

class MfaVerifyTokenResponseMfaRequiredEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'false')
  static const MfaVerifyTokenResponseMfaRequiredEnum false_ = _$mfaVerifyTokenResponseMfaRequiredEnum_false_;

  static Serializer<MfaVerifyTokenResponseMfaRequiredEnum> get serializer => _$mfaVerifyTokenResponseMfaRequiredEnumSerializer;

  const MfaVerifyTokenResponseMfaRequiredEnum._(String name): super(name);

  static BuiltSet<MfaVerifyTokenResponseMfaRequiredEnum> get values => _$mfaVerifyTokenResponseMfaRequiredEnumValues;
  static MfaVerifyTokenResponseMfaRequiredEnum valueOf(String name) => _$mfaVerifyTokenResponseMfaRequiredEnumValueOf(name);
}

