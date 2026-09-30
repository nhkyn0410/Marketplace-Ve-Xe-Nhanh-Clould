//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'trip_seat_status_input_dto.g.dart';

/// TripSeatStatusInputDto
///
/// Properties:
/// * [seatCodes] 
/// * [status] 
/// * [note] 
@BuiltValue()
abstract class TripSeatStatusInputDto implements Built<TripSeatStatusInputDto, TripSeatStatusInputDtoBuilder> {
  @BuiltValueField(wireName: r'seatCodes')
  BuiltList<String> get seatCodes;

  @BuiltValueField(wireName: r'status')
  TripSeatStatusInputDtoStatusEnum get status;
  // enum statusEnum {  BLOCKED,  AVAILABLE,  };

  @BuiltValueField(wireName: r'note')
  String? get note;

  TripSeatStatusInputDto._();

  factory TripSeatStatusInputDto([void updates(TripSeatStatusInputDtoBuilder b)]) = _$TripSeatStatusInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TripSeatStatusInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TripSeatStatusInputDto> get serializer => _$TripSeatStatusInputDtoSerializer();
}

class _$TripSeatStatusInputDtoSerializer implements PrimitiveSerializer<TripSeatStatusInputDto> {
  @override
  final Iterable<Type> types = const [TripSeatStatusInputDto, _$TripSeatStatusInputDto];

  @override
  final String wireName = r'TripSeatStatusInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TripSeatStatusInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'seatCodes';
    yield serializers.serialize(
      object.seatCodes,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(TripSeatStatusInputDtoStatusEnum),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TripSeatStatusInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TripSeatStatusInputDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'seatCodes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.seatCodes.replace(valueDes);
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(TripSeatStatusInputDtoStatusEnum),
          ) as TripSeatStatusInputDtoStatusEnum;
          result.status = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TripSeatStatusInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TripSeatStatusInputDtoBuilder();
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


class TripSeatStatusInputDtoStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BLOCKED')
  static const TripSeatStatusInputDtoStatusEnum BLOCKED = _$tripSeatStatusInputDtoStatusEnum_BLOCKED;
  @BuiltValueEnumConst(wireName: r'AVAILABLE')
  static const TripSeatStatusInputDtoStatusEnum AVAILABLE = _$tripSeatStatusInputDtoStatusEnum_AVAILABLE;

  static Serializer<TripSeatStatusInputDtoStatusEnum> get serializer => _$tripSeatStatusInputDtoStatusEnumSerializer;

  const TripSeatStatusInputDtoStatusEnum._(String name): super(name);

  static BuiltSet<TripSeatStatusInputDtoStatusEnum> get values => _$tripSeatStatusInputDtoStatusEnumValues;
  static TripSeatStatusInputDtoStatusEnum valueOf(String name) => _$tripSeatStatusInputDtoStatusEnumValueOf(name);
}

