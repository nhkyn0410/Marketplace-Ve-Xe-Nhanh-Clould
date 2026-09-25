//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'operator_stop_point_input_dto.g.dart';

/// OperatorStopPointInputDto
///
/// Properties:
/// * [name] 
/// * [type] 
/// * [address] 
/// * [provinceId] 
/// * [wardId] 
/// * [latitude] 
/// * [longitude] 
/// * [description] 
/// * [status] 
@BuiltValue()
abstract class OperatorStopPointInputDto implements Built<OperatorStopPointInputDto, OperatorStopPointInputDtoBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'type')
  OperatorStopPointInputDtoTypeEnum get type;
  // enum typeEnum {  BUS_STATION,  OFFICE,  REST_STOP,  PICKUP_POINT,  };

  @BuiltValueField(wireName: r'address')
  String get address;

  @BuiltValueField(wireName: r'provinceId')
  String get provinceId;

  @BuiltValueField(wireName: r'wardId')
  String get wardId;

  @BuiltValueField(wireName: r'latitude')
  num get latitude;

  @BuiltValueField(wireName: r'longitude')
  num get longitude;

  @BuiltValueField(wireName: r'description')
  String? get description;

  @BuiltValueField(wireName: r'status')
  OperatorStopPointInputDtoStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  OperatorStopPointInputDto._();

  factory OperatorStopPointInputDto([void updates(OperatorStopPointInputDtoBuilder b)]) = _$OperatorStopPointInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OperatorStopPointInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OperatorStopPointInputDto> get serializer => _$OperatorStopPointInputDtoSerializer();
}

class _$OperatorStopPointInputDtoSerializer implements PrimitiveSerializer<OperatorStopPointInputDto> {
  @override
  final Iterable<Type> types = const [OperatorStopPointInputDto, _$OperatorStopPointInputDto];

  @override
  final String wireName = r'OperatorStopPointInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OperatorStopPointInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'type';
    yield serializers.serialize(
      object.type,
      specifiedType: const FullType(OperatorStopPointInputDtoTypeEnum),
    );
    yield r'address';
    yield serializers.serialize(
      object.address,
      specifiedType: const FullType(String),
    );
    yield r'provinceId';
    yield serializers.serialize(
      object.provinceId,
      specifiedType: const FullType(String),
    );
    yield r'wardId';
    yield serializers.serialize(
      object.wardId,
      specifiedType: const FullType(String),
    );
    yield r'latitude';
    yield serializers.serialize(
      object.latitude,
      specifiedType: const FullType(num),
    );
    yield r'longitude';
    yield serializers.serialize(
      object.longitude,
      specifiedType: const FullType(num),
    );
    yield r'description';
    yield object.description == null ? null : serializers.serialize(
      object.description,
      specifiedType: const FullType.nullable(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(OperatorStopPointInputDtoStatusEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OperatorStopPointInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OperatorStopPointInputDtoBuilder result,
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
        case r'type':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OperatorStopPointInputDtoTypeEnum),
          ) as OperatorStopPointInputDtoTypeEnum;
          result.type = valueDes;
          break;
        case r'address':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.address = valueDes;
          break;
        case r'provinceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.provinceId = valueDes;
          break;
        case r'wardId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.wardId = valueDes;
          break;
        case r'latitude':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.latitude = valueDes;
          break;
        case r'longitude':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.longitude = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.description = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OperatorStopPointInputDtoStatusEnum),
          ) as OperatorStopPointInputDtoStatusEnum;
          result.status = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OperatorStopPointInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OperatorStopPointInputDtoBuilder();
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


class OperatorStopPointInputDtoTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BUS_STATION')
  static const OperatorStopPointInputDtoTypeEnum BUS_STATION = _$operatorStopPointInputDtoTypeEnum_BUS_STATION;
  @BuiltValueEnumConst(wireName: r'OFFICE')
  static const OperatorStopPointInputDtoTypeEnum OFFICE = _$operatorStopPointInputDtoTypeEnum_OFFICE;
  @BuiltValueEnumConst(wireName: r'REST_STOP')
  static const OperatorStopPointInputDtoTypeEnum REST_STOP = _$operatorStopPointInputDtoTypeEnum_REST_STOP;
  @BuiltValueEnumConst(wireName: r'PICKUP_POINT')
  static const OperatorStopPointInputDtoTypeEnum PICKUP_POINT = _$operatorStopPointInputDtoTypeEnum_PICKUP_POINT;

  static Serializer<OperatorStopPointInputDtoTypeEnum> get serializer => _$operatorStopPointInputDtoTypeEnumSerializer;

  const OperatorStopPointInputDtoTypeEnum._(String name): super(name);

  static BuiltSet<OperatorStopPointInputDtoTypeEnum> get values => _$operatorStopPointInputDtoTypeEnumValues;
  static OperatorStopPointInputDtoTypeEnum valueOf(String name) => _$operatorStopPointInputDtoTypeEnumValueOf(name);
}

class OperatorStopPointInputDtoStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const OperatorStopPointInputDtoStatusEnum ACTIVE = _$operatorStopPointInputDtoStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const OperatorStopPointInputDtoStatusEnum INACTIVE = _$operatorStopPointInputDtoStatusEnum_INACTIVE;

  static Serializer<OperatorStopPointInputDtoStatusEnum> get serializer => _$operatorStopPointInputDtoStatusEnumSerializer;

  const OperatorStopPointInputDtoStatusEnum._(String name): super(name);

  static BuiltSet<OperatorStopPointInputDtoStatusEnum> get values => _$operatorStopPointInputDtoStatusEnumValues;
  static OperatorStopPointInputDtoStatusEnum valueOf(String name) => _$operatorStopPointInputDtoStatusEnumValueOf(name);
}

