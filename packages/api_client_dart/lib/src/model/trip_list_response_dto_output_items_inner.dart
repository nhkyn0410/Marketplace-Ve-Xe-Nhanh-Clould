//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'trip_list_response_dto_output_items_inner.g.dart';

/// TripListResponseDtoOutputItemsInner
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
@BuiltValue()
abstract class TripListResponseDtoOutputItemsInner implements Built<TripListResponseDtoOutputItemsInner, TripListResponseDtoOutputItemsInnerBuilder> {
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
  TripListResponseDtoOutputItemsInnerStatusEnum get status;
  // enum statusEnum {  DRAFT,  OPEN_FOR_SALE,  SOLD_OUT,  LOCKED,  BOARDING,  DEPARTED,  IN_PROGRESS,  COMPLETED,  CANCELLED,  INCIDENT,  };

  @BuiltValueField(wireName: r'seatCount')
  int get seatCount;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  TripListResponseDtoOutputItemsInner._();

  factory TripListResponseDtoOutputItemsInner([void updates(TripListResponseDtoOutputItemsInnerBuilder b)]) = _$TripListResponseDtoOutputItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TripListResponseDtoOutputItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TripListResponseDtoOutputItemsInner> get serializer => _$TripListResponseDtoOutputItemsInnerSerializer();
}

class _$TripListResponseDtoOutputItemsInnerSerializer implements PrimitiveSerializer<TripListResponseDtoOutputItemsInner> {
  @override
  final Iterable<Type> types = const [TripListResponseDtoOutputItemsInner, _$TripListResponseDtoOutputItemsInner];

  @override
  final String wireName = r'TripListResponseDtoOutputItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TripListResponseDtoOutputItemsInner object, {
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
      specifiedType: const FullType(TripListResponseDtoOutputItemsInnerStatusEnum),
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
  }

  @override
  Object serialize(
    Serializers serializers,
    TripListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TripListResponseDtoOutputItemsInnerBuilder result,
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
            specifiedType: const FullType(TripListResponseDtoOutputItemsInnerStatusEnum),
          ) as TripListResponseDtoOutputItemsInnerStatusEnum;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TripListResponseDtoOutputItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TripListResponseDtoOutputItemsInnerBuilder();
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


class TripListResponseDtoOutputItemsInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const TripListResponseDtoOutputItemsInnerStatusEnum DRAFT = _$tripListResponseDtoOutputItemsInnerStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'OPEN_FOR_SALE')
  static const TripListResponseDtoOutputItemsInnerStatusEnum OPEN_FOR_SALE = _$tripListResponseDtoOutputItemsInnerStatusEnum_OPEN_FOR_SALE;
  @BuiltValueEnumConst(wireName: r'SOLD_OUT')
  static const TripListResponseDtoOutputItemsInnerStatusEnum SOLD_OUT = _$tripListResponseDtoOutputItemsInnerStatusEnum_SOLD_OUT;
  @BuiltValueEnumConst(wireName: r'LOCKED')
  static const TripListResponseDtoOutputItemsInnerStatusEnum LOCKED = _$tripListResponseDtoOutputItemsInnerStatusEnum_LOCKED;
  @BuiltValueEnumConst(wireName: r'BOARDING')
  static const TripListResponseDtoOutputItemsInnerStatusEnum BOARDING = _$tripListResponseDtoOutputItemsInnerStatusEnum_BOARDING;
  @BuiltValueEnumConst(wireName: r'DEPARTED')
  static const TripListResponseDtoOutputItemsInnerStatusEnum DEPARTED = _$tripListResponseDtoOutputItemsInnerStatusEnum_DEPARTED;
  @BuiltValueEnumConst(wireName: r'IN_PROGRESS')
  static const TripListResponseDtoOutputItemsInnerStatusEnum IN_PROGRESS = _$tripListResponseDtoOutputItemsInnerStatusEnum_IN_PROGRESS;
  @BuiltValueEnumConst(wireName: r'COMPLETED')
  static const TripListResponseDtoOutputItemsInnerStatusEnum COMPLETED = _$tripListResponseDtoOutputItemsInnerStatusEnum_COMPLETED;
  @BuiltValueEnumConst(wireName: r'CANCELLED')
  static const TripListResponseDtoOutputItemsInnerStatusEnum CANCELLED = _$tripListResponseDtoOutputItemsInnerStatusEnum_CANCELLED;
  @BuiltValueEnumConst(wireName: r'INCIDENT')
  static const TripListResponseDtoOutputItemsInnerStatusEnum INCIDENT = _$tripListResponseDtoOutputItemsInnerStatusEnum_INCIDENT;

  static Serializer<TripListResponseDtoOutputItemsInnerStatusEnum> get serializer => _$tripListResponseDtoOutputItemsInnerStatusEnumSerializer;

  const TripListResponseDtoOutputItemsInnerStatusEnum._(String name): super(name);

  static BuiltSet<TripListResponseDtoOutputItemsInnerStatusEnum> get values => _$tripListResponseDtoOutputItemsInnerStatusEnumValues;
  static TripListResponseDtoOutputItemsInnerStatusEnum valueOf(String name) => _$tripListResponseDtoOutputItemsInnerStatusEnumValueOf(name);
}

