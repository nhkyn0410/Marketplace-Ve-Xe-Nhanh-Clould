//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'operator_stop_point_response_dto_output.g.dart';

/// OperatorStopPointResponseDtoOutput
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [type] 
/// * [address] 
/// * [provinceId] 
/// * [wardId] 
/// * [latitude] 
/// * [longitude] 
/// * [description] 
/// * [createdAt] 
/// * [updatedAt] 
/// * [status] 
@BuiltValue()
abstract class OperatorStopPointResponseDtoOutput implements Built<OperatorStopPointResponseDtoOutput, OperatorStopPointResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'type')
  OperatorStopPointResponseDtoOutputTypeEnum get type;
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

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  @BuiltValueField(wireName: r'status')
  OperatorStopPointResponseDtoOutputStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  OperatorStopPointResponseDtoOutput._();

  factory OperatorStopPointResponseDtoOutput([void updates(OperatorStopPointResponseDtoOutputBuilder b)]) = _$OperatorStopPointResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OperatorStopPointResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OperatorStopPointResponseDtoOutput> get serializer => _$OperatorStopPointResponseDtoOutputSerializer();
}

class _$OperatorStopPointResponseDtoOutputSerializer implements PrimitiveSerializer<OperatorStopPointResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [OperatorStopPointResponseDtoOutput, _$OperatorStopPointResponseDtoOutput];

  @override
  final String wireName = r'OperatorStopPointResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OperatorStopPointResponseDtoOutput object, {
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
    yield r'type';
    yield serializers.serialize(
      object.type,
      specifiedType: const FullType(OperatorStopPointResponseDtoOutputTypeEnum),
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
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(OperatorStopPointResponseDtoOutputStatusEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OperatorStopPointResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OperatorStopPointResponseDtoOutputBuilder result,
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
        case r'type':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OperatorStopPointResponseDtoOutputTypeEnum),
          ) as OperatorStopPointResponseDtoOutputTypeEnum;
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OperatorStopPointResponseDtoOutputStatusEnum),
          ) as OperatorStopPointResponseDtoOutputStatusEnum;
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
  OperatorStopPointResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OperatorStopPointResponseDtoOutputBuilder();
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


class OperatorStopPointResponseDtoOutputTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BUS_STATION')
  static const OperatorStopPointResponseDtoOutputTypeEnum BUS_STATION = _$operatorStopPointResponseDtoOutputTypeEnum_BUS_STATION;
  @BuiltValueEnumConst(wireName: r'OFFICE')
  static const OperatorStopPointResponseDtoOutputTypeEnum OFFICE = _$operatorStopPointResponseDtoOutputTypeEnum_OFFICE;
  @BuiltValueEnumConst(wireName: r'REST_STOP')
  static const OperatorStopPointResponseDtoOutputTypeEnum REST_STOP = _$operatorStopPointResponseDtoOutputTypeEnum_REST_STOP;
  @BuiltValueEnumConst(wireName: r'PICKUP_POINT')
  static const OperatorStopPointResponseDtoOutputTypeEnum PICKUP_POINT = _$operatorStopPointResponseDtoOutputTypeEnum_PICKUP_POINT;

  static Serializer<OperatorStopPointResponseDtoOutputTypeEnum> get serializer => _$operatorStopPointResponseDtoOutputTypeEnumSerializer;

  const OperatorStopPointResponseDtoOutputTypeEnum._(String name): super(name);

  static BuiltSet<OperatorStopPointResponseDtoOutputTypeEnum> get values => _$operatorStopPointResponseDtoOutputTypeEnumValues;
  static OperatorStopPointResponseDtoOutputTypeEnum valueOf(String name) => _$operatorStopPointResponseDtoOutputTypeEnumValueOf(name);
}

class OperatorStopPointResponseDtoOutputStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const OperatorStopPointResponseDtoOutputStatusEnum ACTIVE = _$operatorStopPointResponseDtoOutputStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const OperatorStopPointResponseDtoOutputStatusEnum INACTIVE = _$operatorStopPointResponseDtoOutputStatusEnum_INACTIVE;

  static Serializer<OperatorStopPointResponseDtoOutputStatusEnum> get serializer => _$operatorStopPointResponseDtoOutputStatusEnumSerializer;

  const OperatorStopPointResponseDtoOutputStatusEnum._(String name): super(name);

  static BuiltSet<OperatorStopPointResponseDtoOutputStatusEnum> get values => _$operatorStopPointResponseDtoOutputStatusEnumValues;
  static OperatorStopPointResponseDtoOutputStatusEnum valueOf(String name) => _$operatorStopPointResponseDtoOutputStatusEnumValueOf(name);
}

