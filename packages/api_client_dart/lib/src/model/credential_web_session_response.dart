//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'credential_web_session_response.g.dart';

/// CredentialWebSessionResponse
///
/// Properties:
/// * [authenticated] 
/// * [scope] 
/// * [role] 
/// * [expiresIn] 
/// * [refreshExpiresIn] 
@BuiltValue()
abstract class CredentialWebSessionResponse implements Built<CredentialWebSessionResponse, CredentialWebSessionResponseBuilder> {
  @BuiltValueField(wireName: r'authenticated')
  CredentialWebSessionResponseAuthenticatedEnum get authenticated;
  // enum authenticatedEnum {  true,  };

  @BuiltValueField(wireName: r'scope')
  CredentialWebSessionResponseScopeEnum get scope;
  // enum scopeEnum {  passenger,  operator,  platform,  };

  @BuiltValueField(wireName: r'role')
  String get role;

  @BuiltValueField(wireName: r'expiresIn')
  int get expiresIn;

  @BuiltValueField(wireName: r'refreshExpiresIn')
  int get refreshExpiresIn;

  CredentialWebSessionResponse._();

  factory CredentialWebSessionResponse([void updates(CredentialWebSessionResponseBuilder b)]) = _$CredentialWebSessionResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CredentialWebSessionResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CredentialWebSessionResponse> get serializer => _$CredentialWebSessionResponseSerializer();
}

class _$CredentialWebSessionResponseSerializer implements PrimitiveSerializer<CredentialWebSessionResponse> {
  @override
  final Iterable<Type> types = const [CredentialWebSessionResponse, _$CredentialWebSessionResponse];

  @override
  final String wireName = r'CredentialWebSessionResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CredentialWebSessionResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'authenticated';
    yield serializers.serialize(
      object.authenticated,
      specifiedType: const FullType(CredentialWebSessionResponseAuthenticatedEnum),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(CredentialWebSessionResponseScopeEnum),
    );
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(String),
    );
    yield r'expiresIn';
    yield serializers.serialize(
      object.expiresIn,
      specifiedType: const FullType(int),
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
    CredentialWebSessionResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CredentialWebSessionResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'authenticated':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CredentialWebSessionResponseAuthenticatedEnum),
          ) as CredentialWebSessionResponseAuthenticatedEnum;
          result.authenticated = valueDes;
          break;
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CredentialWebSessionResponseScopeEnum),
          ) as CredentialWebSessionResponseScopeEnum;
          result.scope = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.role = valueDes;
          break;
        case r'expiresIn':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expiresIn = valueDes;
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
  CredentialWebSessionResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CredentialWebSessionResponseBuilder();
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


class CredentialWebSessionResponseAuthenticatedEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const CredentialWebSessionResponseAuthenticatedEnum true_ = _$credentialWebSessionResponseAuthenticatedEnum_true_;

  static Serializer<CredentialWebSessionResponseAuthenticatedEnum> get serializer => _$credentialWebSessionResponseAuthenticatedEnumSerializer;

  const CredentialWebSessionResponseAuthenticatedEnum._(String name): super(name);

  static BuiltSet<CredentialWebSessionResponseAuthenticatedEnum> get values => _$credentialWebSessionResponseAuthenticatedEnumValues;
  static CredentialWebSessionResponseAuthenticatedEnum valueOf(String name) => _$credentialWebSessionResponseAuthenticatedEnumValueOf(name);
}

class CredentialWebSessionResponseScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const CredentialWebSessionResponseScopeEnum passenger = _$credentialWebSessionResponseScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const CredentialWebSessionResponseScopeEnum operator_ = _$credentialWebSessionResponseScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const CredentialWebSessionResponseScopeEnum platform = _$credentialWebSessionResponseScopeEnum_platform;

  static Serializer<CredentialWebSessionResponseScopeEnum> get serializer => _$credentialWebSessionResponseScopeEnumSerializer;

  const CredentialWebSessionResponseScopeEnum._(String name): super(name);

  static BuiltSet<CredentialWebSessionResponseScopeEnum> get values => _$credentialWebSessionResponseScopeEnumValues;
  static CredentialWebSessionResponseScopeEnum valueOf(String name) => _$credentialWebSessionResponseScopeEnumValueOf(name);
}

