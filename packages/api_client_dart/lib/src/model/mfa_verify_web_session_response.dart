//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'mfa_verify_web_session_response.g.dart';

/// MfaVerifyWebSessionResponse
///
/// Properties:
/// * [authenticated] 
/// * [scope] 
/// * [role] 
/// * [expiresIn] 
/// * [refreshExpiresIn] 
/// * [backupCodes] 
@BuiltValue()
abstract class MfaVerifyWebSessionResponse implements Built<MfaVerifyWebSessionResponse, MfaVerifyWebSessionResponseBuilder> {
  @BuiltValueField(wireName: r'authenticated')
  MfaVerifyWebSessionResponseAuthenticatedEnum get authenticated;
  // enum authenticatedEnum {  true,  };

  @BuiltValueField(wireName: r'scope')
  MfaVerifyWebSessionResponseScopeEnum get scope;
  // enum scopeEnum {  passenger,  operator,  platform,  };

  @BuiltValueField(wireName: r'role')
  String get role;

  @BuiltValueField(wireName: r'expiresIn')
  int get expiresIn;

  @BuiltValueField(wireName: r'refreshExpiresIn')
  int get refreshExpiresIn;

  @BuiltValueField(wireName: r'backupCodes')
  BuiltList<String>? get backupCodes;

  MfaVerifyWebSessionResponse._();

  factory MfaVerifyWebSessionResponse([void updates(MfaVerifyWebSessionResponseBuilder b)]) = _$MfaVerifyWebSessionResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MfaVerifyWebSessionResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MfaVerifyWebSessionResponse> get serializer => _$MfaVerifyWebSessionResponseSerializer();
}

class _$MfaVerifyWebSessionResponseSerializer implements PrimitiveSerializer<MfaVerifyWebSessionResponse> {
  @override
  final Iterable<Type> types = const [MfaVerifyWebSessionResponse, _$MfaVerifyWebSessionResponse];

  @override
  final String wireName = r'MfaVerifyWebSessionResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MfaVerifyWebSessionResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'authenticated';
    yield serializers.serialize(
      object.authenticated,
      specifiedType: const FullType(MfaVerifyWebSessionResponseAuthenticatedEnum),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(MfaVerifyWebSessionResponseScopeEnum),
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
    MfaVerifyWebSessionResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MfaVerifyWebSessionResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'authenticated':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MfaVerifyWebSessionResponseAuthenticatedEnum),
          ) as MfaVerifyWebSessionResponseAuthenticatedEnum;
          result.authenticated = valueDes;
          break;
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MfaVerifyWebSessionResponseScopeEnum),
          ) as MfaVerifyWebSessionResponseScopeEnum;
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
  MfaVerifyWebSessionResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MfaVerifyWebSessionResponseBuilder();
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


class MfaVerifyWebSessionResponseAuthenticatedEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const MfaVerifyWebSessionResponseAuthenticatedEnum true_ = _$mfaVerifyWebSessionResponseAuthenticatedEnum_true_;

  static Serializer<MfaVerifyWebSessionResponseAuthenticatedEnum> get serializer => _$mfaVerifyWebSessionResponseAuthenticatedEnumSerializer;

  const MfaVerifyWebSessionResponseAuthenticatedEnum._(String name): super(name);

  static BuiltSet<MfaVerifyWebSessionResponseAuthenticatedEnum> get values => _$mfaVerifyWebSessionResponseAuthenticatedEnumValues;
  static MfaVerifyWebSessionResponseAuthenticatedEnum valueOf(String name) => _$mfaVerifyWebSessionResponseAuthenticatedEnumValueOf(name);
}

class MfaVerifyWebSessionResponseScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const MfaVerifyWebSessionResponseScopeEnum passenger = _$mfaVerifyWebSessionResponseScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const MfaVerifyWebSessionResponseScopeEnum operator_ = _$mfaVerifyWebSessionResponseScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const MfaVerifyWebSessionResponseScopeEnum platform = _$mfaVerifyWebSessionResponseScopeEnum_platform;

  static Serializer<MfaVerifyWebSessionResponseScopeEnum> get serializer => _$mfaVerifyWebSessionResponseScopeEnumSerializer;

  const MfaVerifyWebSessionResponseScopeEnum._(String name): super(name);

  static BuiltSet<MfaVerifyWebSessionResponseScopeEnum> get values => _$mfaVerifyWebSessionResponseScopeEnumValues;
  static MfaVerifyWebSessionResponseScopeEnum valueOf(String name) => _$mfaVerifyWebSessionResponseScopeEnumValueOf(name);
}

