//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/seat_map_response_dto_output_layout_decks_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'seat_map_response_dto_output_layout.g.dart';

/// SeatMapResponseDtoOutputLayout
///
/// Properties:
/// * [decks] 
@BuiltValue()
abstract class SeatMapResponseDtoOutputLayout implements Built<SeatMapResponseDtoOutputLayout, SeatMapResponseDtoOutputLayoutBuilder> {
  @BuiltValueField(wireName: r'decks')
  BuiltList<SeatMapResponseDtoOutputLayoutDecksInner> get decks;

  SeatMapResponseDtoOutputLayout._();

  factory SeatMapResponseDtoOutputLayout([void updates(SeatMapResponseDtoOutputLayoutBuilder b)]) = _$SeatMapResponseDtoOutputLayout;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SeatMapResponseDtoOutputLayoutBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SeatMapResponseDtoOutputLayout> get serializer => _$SeatMapResponseDtoOutputLayoutSerializer();
}

class _$SeatMapResponseDtoOutputLayoutSerializer implements PrimitiveSerializer<SeatMapResponseDtoOutputLayout> {
  @override
  final Iterable<Type> types = const [SeatMapResponseDtoOutputLayout, _$SeatMapResponseDtoOutputLayout];

  @override
  final String wireName = r'SeatMapResponseDtoOutputLayout';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SeatMapResponseDtoOutputLayout object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'decks';
    yield serializers.serialize(
      object.decks,
      specifiedType: const FullType(BuiltList, [FullType(SeatMapResponseDtoOutputLayoutDecksInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SeatMapResponseDtoOutputLayout object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SeatMapResponseDtoOutputLayoutBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'decks':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(SeatMapResponseDtoOutputLayoutDecksInner)]),
          ) as BuiltList<SeatMapResponseDtoOutputLayoutDecksInner>;
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
  SeatMapResponseDtoOutputLayout deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SeatMapResponseDtoOutputLayoutBuilder();
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


