//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'vehicle_input_dto.g.dart';

/// VehicleInputDto
///
/// Properties:
/// * [plateNumber] 
/// * [vehicleTypeId] 
/// * [seatMapId] 
/// * [amenityIds] 
/// * [status] 
/// * [description] 
@BuiltValue()
abstract class VehicleInputDto implements Built<VehicleInputDto, VehicleInputDtoBuilder> {
  @BuiltValueField(wireName: r'plateNumber')
  String get plateNumber;

  @BuiltValueField(wireName: r'vehicleTypeId')
  String get vehicleTypeId;

  @BuiltValueField(wireName: r'seatMapId')
  String? get seatMapId;

  @BuiltValueField(wireName: r'amenityIds')
  BuiltList<String> get amenityIds;

  @BuiltValueField(wireName: r'status')
  VehicleInputDtoStatusEnum get status;
  // enum statusEnum {  ACTIVE,  MAINTENANCE,  INACTIVE,  };

  @BuiltValueField(wireName: r'description')
  String? get description;

  VehicleInputDto._();

  factory VehicleInputDto([void updates(VehicleInputDtoBuilder b)]) = _$VehicleInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VehicleInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VehicleInputDto> get serializer => _$VehicleInputDtoSerializer();
}

class _$VehicleInputDtoSerializer implements PrimitiveSerializer<VehicleInputDto> {
  @override
  final Iterable<Type> types = const [VehicleInputDto, _$VehicleInputDto];

  @override
  final String wireName = r'VehicleInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VehicleInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
      specifiedType: const FullType(VehicleInputDtoStatusEnum),
    );
    yield r'description';
    yield object.description == null ? null : serializers.serialize(
      object.description,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    VehicleInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VehicleInputDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
            specifiedType: const FullType(VehicleInputDtoStatusEnum),
          ) as VehicleInputDtoStatusEnum;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VehicleInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VehicleInputDtoBuilder();
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


class VehicleInputDtoStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const VehicleInputDtoStatusEnum ACTIVE = _$vehicleInputDtoStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'MAINTENANCE')
  static const VehicleInputDtoStatusEnum MAINTENANCE = _$vehicleInputDtoStatusEnum_MAINTENANCE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const VehicleInputDtoStatusEnum INACTIVE = _$vehicleInputDtoStatusEnum_INACTIVE;

  static Serializer<VehicleInputDtoStatusEnum> get serializer => _$vehicleInputDtoStatusEnumSerializer;

  const VehicleInputDtoStatusEnum._(String name): super(name);

  static BuiltSet<VehicleInputDtoStatusEnum> get values => _$vehicleInputDtoStatusEnumValues;
  static VehicleInputDtoStatusEnum valueOf(String name) => _$vehicleInputDtoStatusEnumValueOf(name);
}

