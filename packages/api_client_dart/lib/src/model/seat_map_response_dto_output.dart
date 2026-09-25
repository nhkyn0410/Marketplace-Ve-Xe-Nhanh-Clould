//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:api_client_dart/src/model/seat_map_response_dto_output_layout.dart';
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/seat_map_response_dto_output_seats_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'seat_map_response_dto_output.g.dart';

/// SeatMapResponseDtoOutput
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [seatCount] 
/// * [createdAt] 
/// * [updatedAt] 
/// * [layout] 
/// * [seats] 
@BuiltValue()
abstract class SeatMapResponseDtoOutput implements Built<SeatMapResponseDtoOutput, SeatMapResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'seatCount')
  int get seatCount;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  @BuiltValueField(wireName: r'layout')
  SeatMapResponseDtoOutputLayout get layout;

  @BuiltValueField(wireName: r'seats')
  BuiltList<SeatMapResponseDtoOutputSeatsInner> get seats;

  SeatMapResponseDtoOutput._();

  factory SeatMapResponseDtoOutput([void updates(SeatMapResponseDtoOutputBuilder b)]) = _$SeatMapResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SeatMapResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SeatMapResponseDtoOutput> get serializer => _$SeatMapResponseDtoOutputSerializer();
}

class _$SeatMapResponseDtoOutputSerializer implements PrimitiveSerializer<SeatMapResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [SeatMapResponseDtoOutput, _$SeatMapResponseDtoOutput];

  @override
  final String wireName = r'SeatMapResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SeatMapResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'seatCount';
    yield serializers.serialize(
      object.seatCount,
      specifiedType: const FullType(int),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'layout';
    yield serializers.serialize(
      object.layout,
      specifiedType: const FullType(SeatMapResponseDtoOutputLayout),
    );
    yield r'seats';
    yield serializers.serialize(
      object.seats,
      specifiedType: const FullType(BuiltList, [FullType(SeatMapResponseDtoOutputSeatsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SeatMapResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SeatMapResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'seatCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.seatCount = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        case r'layout':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SeatMapResponseDtoOutputLayout),
          ) as SeatMapResponseDtoOutputLayout;
          result.layout.replace(valueDes);
          break;
        case r'seats':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(SeatMapResponseDtoOutputSeatsInner)]),
          ) as BuiltList<SeatMapResponseDtoOutputSeatsInner>;
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
  SeatMapResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SeatMapResponseDtoOutputBuilder();
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


