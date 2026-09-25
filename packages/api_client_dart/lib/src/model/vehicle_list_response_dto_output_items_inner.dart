//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'vehicle_list_response_dto_output_items_inner.g.dart';

/// VehicleListResponseDtoOutputItemsInner
///
/// Properties:
/// * [id] 
/// * [plateNumber] 
/// * [vehicleTypeId] 
/// * [seatMapId] 
/// * [amenityIds] 
/// * [status] 
/// * [description] 
/// * [createdAt] 
/// * [updatedAt] 
@BuiltValue()
abstract class VehicleListResponseDtoOutputItemsInner implements Built<VehicleListResponseDtoOutputItemsInner, VehicleListResponseDtoOutputItemsInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'plateNumber')
  String get plateNumber;

  @BuiltValueField(wireName: r'vehicleTypeId')
  String get vehicleTypeId;

  @BuiltValueField(wireName: r'seatMapId')
  String? get seatMapId;

  @BuiltValueField(wireName: r'amenityIds')
  BuiltList<String> get amenityIds;

  @BuiltValueField(wireName: r'status')
  VehicleListResponseDtoOutputItemsInnerStatusEnum get status;
  // enum statusEnum {  ACTIVE,  MAINTENANCE,  INACTIVE,  };

  @BuiltValueField(wireName: r'description')
  String? get description;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  VehicleListResponseDtoOutputItemsInner._();

  factory VehicleListResponseDtoOutputItemsInner([void updates(VehicleListResponseDtoOutputItemsInnerBuilder b)]) = _$VehicleListResponseDtoOutputItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VehicleListResponseDtoOutputItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VehicleListResponseDtoOutputItemsInner> get serializer => _$VehicleListResponseDtoOutputItemsInnerSerializer();
}

class _$VehicleListResponseDtoOutputItemsInnerSerializer implements PrimitiveSerializer<VehicleListResponseDtoOutputItemsInner> {
  @override
  final Iterable<Type> types = const [VehicleListResponseDtoOutputItemsInner, _$VehicleListResponseDtoOutputItemsInner];

  @override
  final String wireName = r'VehicleListResponseDtoOutputItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VehicleListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'plateNumber';
    yield serializers.serialize(
      object.plateNumber,
      specifiedType: const FullType(String),
    );
    yield r'vehicleTypeId';
    yield serializers.serialize(
      object.vehicleTypeId,
      specifiedType: const FullType(String),
    );
    yield r'seatMapId';
    yield object.seatMapId == null ? null : serializers.serialize(
      object.seatMapId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'amenityIds';
    yield serializers.serialize(
      object.amenityIds,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(VehicleListResponseDtoOutputItemsInnerStatusEnum),
    );
    yield r'description';
    yield object.description == null ? null : serializers.serialize(
      object.description,
      specifiedType: const FullType.nullable(String),
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
    VehicleListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VehicleListResponseDtoOutputItemsInnerBuilder result,
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
        case r'plateNumber':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.plateNumber = valueDes;
          break;
        case r'vehicleTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.vehicleTypeId = valueDes;
          break;
        case r'seatMapId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.seatMapId = valueDes;
          break;
        case r'amenityIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.amenityIds.replace(valueDes);
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(VehicleListResponseDtoOutputItemsInnerStatusEnum),
          ) as VehicleListResponseDtoOutputItemsInnerStatusEnum;
          result.status = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.description = valueDes;
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
  VehicleListResponseDtoOutputItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VehicleListResponseDtoOutputItemsInnerBuilder();
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


class VehicleListResponseDtoOutputItemsInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const VehicleListResponseDtoOutputItemsInnerStatusEnum ACTIVE = _$vehicleListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'MAINTENANCE')
  static const VehicleListResponseDtoOutputItemsInnerStatusEnum MAINTENANCE = _$vehicleListResponseDtoOutputItemsInnerStatusEnum_MAINTENANCE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const VehicleListResponseDtoOutputItemsInnerStatusEnum INACTIVE = _$vehicleListResponseDtoOutputItemsInnerStatusEnum_INACTIVE;

  static Serializer<VehicleListResponseDtoOutputItemsInnerStatusEnum> get serializer => _$vehicleListResponseDtoOutputItemsInnerStatusEnumSerializer;

  const VehicleListResponseDtoOutputItemsInnerStatusEnum._(String name): super(name);

  static BuiltSet<VehicleListResponseDtoOutputItemsInnerStatusEnum> get values => _$vehicleListResponseDtoOutputItemsInnerStatusEnumValues;
  static VehicleListResponseDtoOutputItemsInnerStatusEnum valueOf(String name) => _$vehicleListResponseDtoOutputItemsInnerStatusEnumValueOf(name);
}

