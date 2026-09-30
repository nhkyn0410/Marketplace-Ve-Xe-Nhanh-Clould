//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'auth_me_response_dto_output.g.dart';

/// AuthMeResponseDtoOutput
///
/// Properties:
/// * [subjectId] 
/// * [scope] 
/// * [role] 
/// * [username] 
/// * [sessionId] 
/// * [accessExpiresAt] 
/// * [mfaVerified] 
/// * [operatorId] 
/// * [operatorSlug] 
@BuiltValue()
abstract class AuthMeResponseDtoOutput implements Built<AuthMeResponseDtoOutput, AuthMeResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'subjectId')
  String get subjectId;

  @BuiltValueField(wireName: r'scope')
  AuthMeResponseDtoOutputScopeEnum get scope;
  // enum scopeEnum {  passenger,  operator,  platform,  };

  @BuiltValueField(wireName: r'role')
  String get role;

  @BuiltValueField(wireName: r'username')
  String get username;

  @BuiltValueField(wireName: r'sessionId')
  String get sessionId;

  @BuiltValueField(wireName: r'accessExpiresAt')
  DateTime get accessExpiresAt;

  @BuiltValueField(wireName: r'mfaVerified')
  bool get mfaVerified;

  @BuiltValueField(wireName: r'operatorId')
  String? get operatorId;

  @BuiltValueField(wireName: r'operatorSlug')
  String? get operatorSlug;

  AuthMeResponseDtoOutput._();

  factory AuthMeResponseDtoOutput([void updates(AuthMeResponseDtoOutputBuilder b)]) = _$AuthMeResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AuthMeResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AuthMeResponseDtoOutput> get serializer => _$AuthMeResponseDtoOutputSerializer();
}

class _$AuthMeResponseDtoOutputSerializer implements PrimitiveSerializer<AuthMeResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [AuthMeResponseDtoOutput, _$AuthMeResponseDtoOutput];

  @override
  final String wireName = r'AuthMeResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AuthMeResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'subjectId';
    yield serializers.serialize(
      object.subjectId,
      specifiedType: const FullType(String),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(AuthMeResponseDtoOutputScopeEnum),
    );
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(String),
    );
    yield r'username';
    yield serializers.serialize(
      object.username,
      specifiedType: const FullType(String),
    );
    yield r'sessionId';
    yield serializers.serialize(
      object.sessionId,
      specifiedType: const FullType(String),
    );
    yield r'accessExpiresAt';
    yield serializers.serialize(
      object.accessExpiresAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'mfaVerified';
    yield serializers.serialize(
      object.mfaVerified,
      specifiedType: const FullType(bool),
    );
    if (object.operatorId != null) {
      yield r'operatorId';
      yield serializers.serialize(
        object.operatorId,
        specifiedType: const FullType(String),
      );
    }
    if (object.operatorSlug != null) {
      yield r'operatorSlug';
      yield serializers.serialize(
        object.operatorSlug,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    AuthMeResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AuthMeResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'subjectId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.subjectId = valueDes;
          break;
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AuthMeResponseDtoOutputScopeEnum),
          ) as AuthMeResponseDtoOutputScopeEnum;
          result.scope = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.role = valueDes;
          break;
        case r'username':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.username = valueDes;
          break;
        case r'sessionId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sessionId = valueDes;
          break;
        case r'accessExpiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.accessExpiresAt = valueDes;
          break;
        case r'mfaVerified':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.mfaVerified = valueDes;
          break;
        case r'operatorId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.operatorId = valueDes;
          break;
        case r'operatorSlug':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.operatorSlug = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AuthMeResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AuthMeResponseDtoOutputBuilder();
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


class AuthMeResponseDtoOutputScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const AuthMeResponseDtoOutputScopeEnum passenger = _$authMeResponseDtoOutputScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const AuthMeResponseDtoOutputScopeEnum operator_ = _$authMeResponseDtoOutputScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const AuthMeResponseDtoOutputScopeEnum platform = _$authMeResponseDtoOutputScopeEnum_platform;

  static Serializer<AuthMeResponseDtoOutputScopeEnum> get serializer => _$authMeResponseDtoOutputScopeEnumSerializer;

  const AuthMeResponseDtoOutputScopeEnum._(String name): super(name);

  static BuiltSet<AuthMeResponseDtoOutputScopeEnum> get values => _$authMeResponseDtoOutputScopeEnumValues;
  static AuthMeResponseDtoOutputScopeEnum valueOf(String name) => _$authMeResponseDtoOutputScopeEnumValueOf(name);
}

