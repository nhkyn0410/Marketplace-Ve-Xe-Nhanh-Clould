//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/trip_response_dto_output_seats_inner.dart';
import 'package:api_client_dart/src/model/trip_response_dto_output_stops_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'trip_response_dto_output.g.dart';

/// TripResponseDtoOutput
///
/// Properties:
/// * [id] 
/// * [routeId] 
/// * [routeName] 
/// * [vehicleId] 
/// * [vehiclePlateNumber] 
/// * [departureAt] 
/// * [arrivalAt] 
/// * [status] 
/// * [seatCount] 
/// * [createdAt] 
/// * [updatedAt] 
/// * [onlineSaleCutoffMinutes] 
/// * [statusReason] 
/// * [note] 
/// * [stops] 
/// * [seats] 
@BuiltValue()
abstract class TripResponseDtoOutput implements Built<TripResponseDtoOutput, TripResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'routeId')
  String get routeId;

  @BuiltValueField(wireName: r'routeName')
  String get routeName;

  @BuiltValueField(wireName: r'vehicleId')
  String? get vehicleId;

  @BuiltValueField(wireName: r'vehiclePlateNumber')
  String? get vehiclePlateNumber;

  @BuiltValueField(wireName: r'departureAt')
  DateTime get departureAt;

  @BuiltValueField(wireName: r'arrivalAt')
  DateTime get arrivalAt;

  @BuiltValueField(wireName: r'status')
  TripResponseDtoOutputStatusEnum get status;
  // enum statusEnum {  DRAFT,  OPEN_FOR_SALE,  SOLD_OUT,  LOCKED,  BOARDING,  DEPARTED,  IN_PROGRESS,  COMPLETED,  CANCELLED,  INCIDENT,  };

  @BuiltValueField(wireName: r'seatCount')
  int get seatCount;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  @BuiltValueField(wireName: r'onlineSaleCutoffMinutes')
  int get onlineSaleCutoffMinutes;

  @BuiltValueField(wireName: r'statusReason')
  String? get statusReason;

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'stops')
  BuiltList<TripResponseDtoOutputStopsInner> get stops;

  @BuiltValueField(wireName: r'seats')
  BuiltList<TripResponseDtoOutputSeatsInner> get seats;

  TripResponseDtoOutput._();

  factory TripResponseDtoOutput([void updates(TripResponseDtoOutputBuilder b)]) = _$TripResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TripResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TripResponseDtoOutput> get serializer => _$TripResponseDtoOutputSerializer();
}

class _$TripResponseDtoOutputSerializer implements PrimitiveSerializer<TripResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [TripResponseDtoOutput, _$TripResponseDtoOutput];

  @override
  final String wireName = r'TripResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TripResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'routeId';
    yield serializers.serialize(
      object.routeId,
      specifiedType: const FullType(String),
    );
    yield r'routeName';
    yield serializers.serialize(
      object.routeName,
      specifiedType: const FullType(String),
    );
    yield r'vehicleId';
    yield object.vehicleId == null ? null : serializers.serialize(
      object.vehicleId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'vehiclePlateNumber';
    yield object.vehiclePlateNumber == null ? null : serializers.serialize(
      object.vehiclePlateNumber,
      specifiedType: const FullType.nullable(String),
    );
    yield r'departureAt';
    yield serializers.serialize(
      object.departureAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'arrivalAt';
    yield serializers.serialize(
      object.arrivalAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(TripResponseDtoOutputStatusEnum),
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
    yield r'onlineSaleCutoffMinutes';
    yield serializers.serialize(
      object.onlineSaleCutoffMinutes,
      specifiedType: const FullType(int),
    );
    yield r'statusReason';
    yield object.statusReason == null ? null : serializers.serialize(
      object.statusReason,
      specifiedType: const FullType.nullable(String),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
    yield r'stops';
    yield serializers.serialize(
      object.stops,
      specifiedType: const FullType(BuiltList, [FullType(TripResponseDtoOutputStopsInner)]),
    );
    yield r'seats';
    yield serializers.serialize(
      object.seats,
      specifiedType: const FullType(BuiltList, [FullType(TripResponseDtoOutputSeatsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TripResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TripResponseDtoOutputBuilder result,
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
        case r'routeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.routeId = valueDes;
          break;
        case r'routeName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.routeName = valueDes;
          break;
        case r'vehicleId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.vehicleId = valueDes;
          break;
        case r'vehiclePlateNumber':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.vehiclePlateNumber = valueDes;
          break;
        case r'departureAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.departureAt = valueDes;
          break;
        case r'arrivalAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.arrivalAt = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(TripResponseDtoOutputStatusEnum),
          ) as TripResponseDtoOutputStatusEnum;
          result.status = valueDes;
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
        case r'onlineSaleCutoffMinutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.onlineSaleCutoffMinutes = valueDes;
          break;
        case r'statusReason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.statusReason = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        case r'stops':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(TripResponseDtoOutputStopsInner)]),
          ) as BuiltList<TripResponseDtoOutputStopsInner>;
          result.stops.replace(valueDes);
          break;
        case r'seats':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(TripResponseDtoOutputSeatsInner)]),
          ) as BuiltList<TripResponseDtoOutputSeatsInner>;
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
  TripResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TripResponseDtoOutputBuilder();
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


class TripResponseDtoOutputStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const TripResponseDtoOutputStatusEnum DRAFT = _$tripResponseDtoOutputStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'OPEN_FOR_SALE')
  static const TripResponseDtoOutputStatusEnum OPEN_FOR_SALE = _$tripResponseDtoOutputStatusEnum_OPEN_FOR_SALE;
  @BuiltValueEnumConst(wireName: r'SOLD_OUT')
  static const TripResponseDtoOutputStatusEnum SOLD_OUT = _$tripResponseDtoOutputStatusEnum_SOLD_OUT;
  @BuiltValueEnumConst(wireName: r'LOCKED')
  static const TripResponseDtoOutputStatusEnum LOCKED = _$tripResponseDtoOutputStatusEnum_LOCKED;
  @BuiltValueEnumConst(wireName: r'BOARDING')
  static const TripResponseDtoOutputStatusEnum BOARDING = _$tripResponseDtoOutputStatusEnum_BOARDING;
  @BuiltValueEnumConst(wireName: r'DEPARTED')
  static const TripResponseDtoOutputStatusEnum DEPARTED = _$tripResponseDtoOutputStatusEnum_DEPARTED;
  @BuiltValueEnumConst(wireName: r'IN_PROGRESS')
  static const TripResponseDtoOutputStatusEnum IN_PROGRESS = _$tripResponseDtoOutputStatusEnum_IN_PROGRESS;
  @BuiltValueEnumConst(wireName: r'COMPLETED')
  static const TripResponseDtoOutputStatusEnum COMPLETED = _$tripResponseDtoOutputStatusEnum_COMPLETED;
  @BuiltValueEnumConst(wireName: r'CANCELLED')
  static const TripResponseDtoOutputStatusEnum CANCELLED = _$tripResponseDtoOutputStatusEnum_CANCELLED;
  @BuiltValueEnumConst(wireName: r'INCIDENT')
  static const TripResponseDtoOutputStatusEnum INCIDENT = _$tripResponseDtoOutputStatusEnum_INCIDENT;

  static Serializer<TripResponseDtoOutputStatusEnum> get serializer => _$tripResponseDtoOutputStatusEnumSerializer;

  const TripResponseDtoOutputStatusEnum._(String name): super(name);

  static BuiltSet<TripResponseDtoOutputStatusEnum> get values => _$tripResponseDtoOutputStatusEnumValues;
  static TripResponseDtoOutputStatusEnum valueOf(String name) => _$tripResponseDtoOutputStatusEnumValueOf(name);
}

