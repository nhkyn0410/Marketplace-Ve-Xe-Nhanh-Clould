//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'operator_stop_point_list_response_dto_output_items_inner.g.dart';

/// OperatorStopPointListResponseDtoOutputItemsInner
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
abstract class OperatorStopPointListResponseDtoOutputItemsInner implements Built<OperatorStopPointListResponseDtoOutputItemsInner, OperatorStopPointListResponseDtoOutputItemsInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'type')
  OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum get type;
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
  OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  OperatorStopPointListResponseDtoOutputItemsInner._();

  factory OperatorStopPointListResponseDtoOutputItemsInner([void updates(OperatorStopPointListResponseDtoOutputItemsInnerBuilder b)]) = _$OperatorStopPointListResponseDtoOutputItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OperatorStopPointListResponseDtoOutputItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OperatorStopPointListResponseDtoOutputItemsInner> get serializer => _$OperatorStopPointListResponseDtoOutputItemsInnerSerializer();
}

class _$OperatorStopPointListResponseDtoOutputItemsInnerSerializer implements PrimitiveSerializer<OperatorStopPointListResponseDtoOutputItemsInner> {
  @override
  final Iterable<Type> types = const [OperatorStopPointListResponseDtoOutputItemsInner, _$OperatorStopPointListResponseDtoOutputItemsInner];

  @override
  final String wireName = r'OperatorStopPointListResponseDtoOutputItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OperatorStopPointListResponseDtoOutputItemsInner object, {
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
      specifiedType: const FullType(OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum),
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
      specifiedType: const FullType(OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OperatorStopPointListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OperatorStopPointListResponseDtoOutputItemsInnerBuilder result,
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
            specifiedType: const FullType(OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum),
          ) as OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum;
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
            specifiedType: const FullType(OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum),
          ) as OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum;
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
  OperatorStopPointListResponseDtoOutputItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OperatorStopPointListResponseDtoOutputItemsInnerBuilder();
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


class OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BUS_STATION')
  static const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum BUS_STATION = _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION;
  @BuiltValueEnumConst(wireName: r'OFFICE')
  static const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum OFFICE = _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_OFFICE;
  @BuiltValueEnumConst(wireName: r'REST_STOP')
  static const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum REST_STOP = _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_REST_STOP;
  @BuiltValueEnumConst(wireName: r'PICKUP_POINT')
  static const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum PICKUP_POINT = _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT;

  static Serializer<OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum> get serializer => _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnumSerializer;

  const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum._(String name): super(name);

  static BuiltSet<OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum> get values => _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnumValues;
  static OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum valueOf(String name) => _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnumValueOf(name);
}

class OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum ACTIVE = _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum INACTIVE = _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnum_INACTIVE;

  static Serializer<OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum> get serializer => _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnumSerializer;

  const OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum._(String name): super(name);

  static BuiltSet<OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum> get values => _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnumValues;
  static OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum valueOf(String name) => _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnumValueOf(name);
}

