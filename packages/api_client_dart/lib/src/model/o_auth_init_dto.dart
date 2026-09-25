//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'o_auth_init_dto.g.dart';

/// OAuthInitDto
///
/// Properties:
/// * [callbackURL] 
@BuiltValue()
abstract class OAuthInitDto implements Built<OAuthInitDto, OAuthInitDtoBuilder> {
  @BuiltValueField(wireName: r'callbackURL')
  String? get callbackURL;

  OAuthInitDto._();

  factory OAuthInitDto([void updates(OAuthInitDtoBuilder b)]) = _$OAuthInitDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OAuthInitDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OAuthInitDto> get serializer => _$OAuthInitDtoSerializer();
}

class _$OAuthInitDtoSerializer implements PrimitiveSerializer<OAuthInitDto> {
  @override
  final Iterable<Type> types = const [OAuthInitDto, _$OAuthInitDto];

  @override
  final String wireName = r'OAuthInitDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OAuthInitDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.callbackURL != null) {
      yield r'callbackURL';
      yield serializers.serialize(
        object.callbackURL,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    OAuthInitDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OAuthInitDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'callbackURL':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.callbackURL = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OAuthInitDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OAuthInitDtoBuilder();
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


