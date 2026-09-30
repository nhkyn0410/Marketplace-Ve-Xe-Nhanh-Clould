//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'csrf_token_response_dto_output.g.dart';

/// CsrfTokenResponseDtoOutput
///
/// Properties:
/// * [csrfToken] 
@BuiltValue()
abstract class CsrfTokenResponseDtoOutput implements Built<CsrfTokenResponseDtoOutput, CsrfTokenResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'csrfToken')
  String get csrfToken;

  CsrfTokenResponseDtoOutput._();

  factory CsrfTokenResponseDtoOutput([void updates(CsrfTokenResponseDtoOutputBuilder b)]) = _$CsrfTokenResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CsrfTokenResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CsrfTokenResponseDtoOutput> get serializer => _$CsrfTokenResponseDtoOutputSerializer();
}

class _$CsrfTokenResponseDtoOutputSerializer implements PrimitiveSerializer<CsrfTokenResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [CsrfTokenResponseDtoOutput, _$CsrfTokenResponseDtoOutput];

  @override
  final String wireName = r'CsrfTokenResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CsrfTokenResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'csrfToken';
    yield serializers.serialize(
      object.csrfToken,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CsrfTokenResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CsrfTokenResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'csrfToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.csrfToken = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CsrfTokenResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CsrfTokenResponseDtoOutputBuilder();
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


