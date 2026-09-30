//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'refresh_web_session_response.g.dart';

/// RefreshWebSessionResponse
///
/// Properties:
/// * [authenticated] 
/// * [scope] 
/// * [role] 
/// * [expiresIn] 
/// * [refreshExpiresIn] 
@BuiltValue()
abstract class RefreshWebSessionResponse implements Built<RefreshWebSessionResponse, RefreshWebSessionResponseBuilder> {
  @BuiltValueField(wireName: r'authenticated')
  RefreshWebSessionResponseAuthenticatedEnum get authenticated;
  // enum authenticatedEnum {  true,  };

  @BuiltValueField(wireName: r'scope')
  RefreshWebSessionResponseScopeEnum get scope;
  // enum scopeEnum {  passenger,  operator,  platform,  };

  @BuiltValueField(wireName: r'role')
  String get role;

  @BuiltValueField(wireName: r'expiresIn')
  int get expiresIn;

  @BuiltValueField(wireName: r'refreshExpiresIn')
  int get refreshExpiresIn;

  RefreshWebSessionResponse._();

  factory RefreshWebSessionResponse([void updates(RefreshWebSessionResponseBuilder b)]) = _$RefreshWebSessionResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RefreshWebSessionResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RefreshWebSessionResponse> get serializer => _$RefreshWebSessionResponseSerializer();
}

class _$RefreshWebSessionResponseSerializer implements PrimitiveSerializer<RefreshWebSessionResponse> {
  @override
  final Iterable<Type> types = const [RefreshWebSessionResponse, _$RefreshWebSessionResponse];

  @override
  final String wireName = r'RefreshWebSessionResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RefreshWebSessionResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'authenticated';
    yield serializers.serialize(
      object.authenticated,
      specifiedType: const FullType(RefreshWebSessionResponseAuthenticatedEnum),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(RefreshWebSessionResponseScopeEnum),
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
    RefreshWebSessionResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RefreshWebSessionResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'authenticated':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RefreshWebSessionResponseAuthenticatedEnum),
          ) as RefreshWebSessionResponseAuthenticatedEnum;
          result.authenticated = valueDes;
          break;
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RefreshWebSessionResponseScopeEnum),
          ) as RefreshWebSessionResponseScopeEnum;
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
  RefreshWebSessionResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RefreshWebSessionResponseBuilder();
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


class RefreshWebSessionResponseAuthenticatedEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const RefreshWebSessionResponseAuthenticatedEnum true_ = _$refreshWebSessionResponseAuthenticatedEnum_true_;

  static Serializer<RefreshWebSessionResponseAuthenticatedEnum> get serializer => _$refreshWebSessionResponseAuthenticatedEnumSerializer;

  const RefreshWebSessionResponseAuthenticatedEnum._(String name): super(name);

  static BuiltSet<RefreshWebSessionResponseAuthenticatedEnum> get values => _$refreshWebSessionResponseAuthenticatedEnumValues;
  static RefreshWebSessionResponseAuthenticatedEnum valueOf(String name) => _$refreshWebSessionResponseAuthenticatedEnumValueOf(name);
}

class RefreshWebSessionResponseScopeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'passenger')
  static const RefreshWebSessionResponseScopeEnum passenger = _$refreshWebSessionResponseScopeEnum_passenger;
  @BuiltValueEnumConst(wireName: r'operator')
  static const RefreshWebSessionResponseScopeEnum operator_ = _$refreshWebSessionResponseScopeEnum_operator_;
  @BuiltValueEnumConst(wireName: r'platform')
  static const RefreshWebSessionResponseScopeEnum platform = _$refreshWebSessionResponseScopeEnum_platform;

  static Serializer<RefreshWebSessionResponseScopeEnum> get serializer => _$refreshWebSessionResponseScopeEnumSerializer;

  const RefreshWebSessionResponseScopeEnum._(String name): super(name);

  static BuiltSet<RefreshWebSessionResponseScopeEnum> get values => _$refreshWebSessionResponseScopeEnumValues;
  static RefreshWebSessionResponseScopeEnum valueOf(String name) => _$refreshWebSessionResponseScopeEnumValueOf(name);
}

