//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'seat_map_input_dto_layout_decks_inner.g.dart';

/// SeatMapInputDtoLayoutDecksInner
///
/// Properties:
/// * [deck] 
/// * [rows] 
/// * [columns] 
@BuiltValue()
abstract class SeatMapInputDtoLayoutDecksInner implements Built<SeatMapInputDtoLayoutDecksInner, SeatMapInputDtoLayoutDecksInnerBuilder> {
  @BuiltValueField(wireName: r'deck')
  int get deck;

  @BuiltValueField(wireName: r'rows')
  int get rows;

  @BuiltValueField(wireName: r'columns')
  int get columns;

  SeatMapInputDtoLayoutDecksInner._();

  factory SeatMapInputDtoLayoutDecksInner([void updates(SeatMapInputDtoLayoutDecksInnerBuilder b)]) = _$SeatMapInputDtoLayoutDecksInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SeatMapInputDtoLayoutDecksInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SeatMapInputDtoLayoutDecksInner> get serializer => _$SeatMapInputDtoLayoutDecksInnerSerializer();
}

class _$SeatMapInputDtoLayoutDecksInnerSerializer implements PrimitiveSerializer<SeatMapInputDtoLayoutDecksInner> {
  @override
  final Iterable<Type> types = const [SeatMapInputDtoLayoutDecksInner, _$SeatMapInputDtoLayoutDecksInner];

  @override
  final String wireName = r'SeatMapInputDtoLayoutDecksInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SeatMapInputDtoLayoutDecksInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'deck';
    yield serializers.serialize(
      object.deck,
      specifiedType: const FullType(int),
    );
    yield r'rows';
    yield serializers.serialize(
      object.rows,
      specifiedType: const FullType(int),
    );
    yield r'columns';
    yield serializers.serialize(
      object.columns,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SeatMapInputDtoLayoutDecksInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SeatMapInputDtoLayoutDecksInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'deck':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.deck = valueDes;
          break;
        case r'rows':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rows = valueDes;
          break;
        case r'columns':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.columns = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SeatMapInputDtoLayoutDecksInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SeatMapInputDtoLayoutDecksInnerBuilder();
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


