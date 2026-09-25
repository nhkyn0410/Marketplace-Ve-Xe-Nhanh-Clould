//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/seat_map_input_dto_layout_decks_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'seat_map_input_dto_layout.g.dart';

/// SeatMapInputDtoLayout
///
/// Properties:
/// * [decks] 
@BuiltValue()
abstract class SeatMapInputDtoLayout implements Built<SeatMapInputDtoLayout, SeatMapInputDtoLayoutBuilder> {
  @BuiltValueField(wireName: r'decks')
  BuiltList<SeatMapInputDtoLayoutDecksInner> get decks;

  SeatMapInputDtoLayout._();

  factory SeatMapInputDtoLayout([void updates(SeatMapInputDtoLayoutBuilder b)]) = _$SeatMapInputDtoLayout;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SeatMapInputDtoLayoutBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SeatMapInputDtoLayout> get serializer => _$SeatMapInputDtoLayoutSerializer();
}

class _$SeatMapInputDtoLayoutSerializer implements PrimitiveSerializer<SeatMapInputDtoLayout> {
  @override
  final Iterable<Type> types = const [SeatMapInputDtoLayout, _$SeatMapInputDtoLayout];

  @override
  final String wireName = r'SeatMapInputDtoLayout';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SeatMapInputDtoLayout object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'decks';
    yield serializers.serialize(
      object.decks,
      specifiedType: const FullType(BuiltList, [FullType(SeatMapInputDtoLayoutDecksInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SeatMapInputDtoLayout object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SeatMapInputDtoLayoutBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'decks':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(SeatMapInputDtoLayoutDecksInner)]),
          ) as BuiltList<SeatMapInputDtoLayoutDecksInner>;
          result.decks.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SeatMapInputDtoLayout deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SeatMapInputDtoLayoutBuilder();
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


