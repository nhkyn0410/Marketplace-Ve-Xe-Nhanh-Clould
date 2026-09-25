//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'seat_map_input_dto_seats_inner.g.dart';

/// SeatMapInputDtoSeatsInner
///
/// Properties:
/// * [code] 
/// * [deck] 
/// * [row] 
/// * [column] 
/// * [type] 
@BuiltValue()
abstract class SeatMapInputDtoSeatsInner implements Built<SeatMapInputDtoSeatsInner, SeatMapInputDtoSeatsInnerBuilder> {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'deck')
  int get deck;

  @BuiltValueField(wireName: r'row')
  int get row;

  @BuiltValueField(wireName: r'column')
  int get column;

  @BuiltValueField(wireName: r'type')
  SeatMapInputDtoSeatsInnerTypeEnum get type;
  // enum typeEnum {  SEAT,  BED,  };

  SeatMapInputDtoSeatsInner._();

  factory SeatMapInputDtoSeatsInner([void updates(SeatMapInputDtoSeatsInnerBuilder b)]) = _$SeatMapInputDtoSeatsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SeatMapInputDtoSeatsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SeatMapInputDtoSeatsInner> get serializer => _$SeatMapInputDtoSeatsInnerSerializer();
}

class _$SeatMapInputDtoSeatsInnerSerializer implements PrimitiveSerializer<SeatMapInputDtoSeatsInner> {
  @override
  final Iterable<Type> types = const [SeatMapInputDtoSeatsInner, _$SeatMapInputDtoSeatsInner];

  @override
  final String wireName = r'SeatMapInputDtoSeatsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SeatMapInputDtoSeatsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'deck';
    yield serializers.serialize(
      object.deck,
      specifiedType: const FullType(int),
    );
    yield r'row';
    yield serializers.serialize(
      object.row,
      specifiedType: const FullType(int),
    );
    yield r'column';
    yield serializers.serialize(
      object.column,
      specifiedType: const FullType(int),
    );
    yield r'type';
    yield serializers.serialize(
      object.type,
      specifiedType: const FullType(SeatMapInputDtoSeatsInnerTypeEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SeatMapInputDtoSeatsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SeatMapInputDtoSeatsInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'deck':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.deck = valueDes;
          break;
        case r'row':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.row = valueDes;
          break;
        case r'column':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.column = valueDes;
          break;
        case r'type':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SeatMapInputDtoSeatsInnerTypeEnum),
          ) as SeatMapInputDtoSeatsInnerTypeEnum;
          result.type = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SeatMapInputDtoSeatsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SeatMapInputDtoSeatsInnerBuilder();
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


class SeatMapInputDtoSeatsInnerTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SEAT')
  static const SeatMapInputDtoSeatsInnerTypeEnum SEAT = _$seatMapInputDtoSeatsInnerTypeEnum_SEAT;
  @BuiltValueEnumConst(wireName: r'BED')
  static const SeatMapInputDtoSeatsInnerTypeEnum BED = _$seatMapInputDtoSeatsInnerTypeEnum_BED;

  static Serializer<SeatMapInputDtoSeatsInnerTypeEnum> get serializer => _$seatMapInputDtoSeatsInnerTypeEnumSerializer;

  const SeatMapInputDtoSeatsInnerTypeEnum._(String name): super(name);

  static BuiltSet<SeatMapInputDtoSeatsInnerTypeEnum> get values => _$seatMapInputDtoSeatsInnerTypeEnumValues;
  static SeatMapInputDtoSeatsInnerTypeEnum valueOf(String name) => _$seatMapInputDtoSeatsInnerTypeEnumValueOf(name);
}

