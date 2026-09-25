//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:api_client_dart/src/model/seat_map_input_dto_seats_inner.dart';
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/seat_map_input_dto_layout.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'seat_map_input_dto.g.dart';

/// SeatMapInputDto
///
/// Properties:
/// * [name] 
/// * [layout] 
/// * [seats] 
@BuiltValue()
abstract class SeatMapInputDto implements Built<SeatMapInputDto, SeatMapInputDtoBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'layout')
  SeatMapInputDtoLayout get layout;

  @BuiltValueField(wireName: r'seats')
  BuiltList<SeatMapInputDtoSeatsInner> get seats;

  SeatMapInputDto._();

  factory SeatMapInputDto([void updates(SeatMapInputDtoBuilder b)]) = _$SeatMapInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SeatMapInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SeatMapInputDto> get serializer => _$SeatMapInputDtoSerializer();
}

class _$SeatMapInputDtoSerializer implements PrimitiveSerializer<SeatMapInputDto> {
  @override
  final Iterable<Type> types = const [SeatMapInputDto, _$SeatMapInputDto];

  @override
  final String wireName = r'SeatMapInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SeatMapInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'layout';
    yield serializers.serialize(
      object.layout,
      specifiedType: const FullType(SeatMapInputDtoLayout),
    );
    yield r'seats';
    yield serializers.serialize(
      object.seats,
      specifiedType: const FullType(BuiltList, [FullType(SeatMapInputDtoSeatsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SeatMapInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SeatMapInputDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'layout':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SeatMapInputDtoLayout),
          ) as SeatMapInputDtoLayout;
          result.layout.replace(valueDes);
          break;
        case r'seats':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(SeatMapInputDtoSeatsInner)]),
          ) as BuiltList<SeatMapInputDtoSeatsInner>;
          result.seats.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SeatMapInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SeatMapInputDtoBuilder();
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


