//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'stop_point_proposal_response_dto_output.g.dart';

/// StopPointProposalResponseDtoOutput
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
/// * [rejectionReason] 
/// * [catalogStopPointId] 
@BuiltValue()
abstract class StopPointProposalResponseDtoOutput implements Built<StopPointProposalResponseDtoOutput, StopPointProposalResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'type')
  StopPointProposalResponseDtoOutputTypeEnum get type;
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
  StopPointProposalResponseDtoOutputStatusEnum get status;
  // enum statusEnum {  PENDING,  APPROVED,  REJECTED,  };

  @BuiltValueField(wireName: r'rejectionReason')
  String? get rejectionReason;

  @BuiltValueField(wireName: r'catalogStopPointId')
  String? get catalogStopPointId;

  StopPointProposalResponseDtoOutput._();

  factory StopPointProposalResponseDtoOutput([void updates(StopPointProposalResponseDtoOutputBuilder b)]) = _$StopPointProposalResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StopPointProposalResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StopPointProposalResponseDtoOutput> get serializer => _$StopPointProposalResponseDtoOutputSerializer();
}

class _$StopPointProposalResponseDtoOutputSerializer implements PrimitiveSerializer<StopPointProposalResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [StopPointProposalResponseDtoOutput, _$StopPointProposalResponseDtoOutput];

  @override
  final String wireName = r'StopPointProposalResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StopPointProposalResponseDtoOutput object, {
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
      specifiedType: const FullType(StopPointProposalResponseDtoOutputTypeEnum),
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
      specifiedType: const FullType(StopPointProposalResponseDtoOutputStatusEnum),
    );
    yield r'rejectionReason';
    yield object.rejectionReason == null ? null : serializers.serialize(
      object.rejectionReason,
      specifiedType: const FullType.nullable(String),
    );
    yield r'catalogStopPointId';
    yield object.catalogStopPointId == null ? null : serializers.serialize(
      object.catalogStopPointId,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    StopPointProposalResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StopPointProposalResponseDtoOutputBuilder result,
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
            specifiedType: const FullType(StopPointProposalResponseDtoOutputTypeEnum),
          ) as StopPointProposalResponseDtoOutputTypeEnum;
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
            specifiedType: const FullType(StopPointProposalResponseDtoOutputStatusEnum),
          ) as StopPointProposalResponseDtoOutputStatusEnum;
          result.status = valueDes;
          break;
        case r'rejectionReason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.rejectionReason = valueDes;
          break;
        case r'catalogStopPointId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.catalogStopPointId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  StopPointProposalResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StopPointProposalResponseDtoOutputBuilder();
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


class StopPointProposalResponseDtoOutputTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BUS_STATION')
  static const StopPointProposalResponseDtoOutputTypeEnum BUS_STATION = _$stopPointProposalResponseDtoOutputTypeEnum_BUS_STATION;
  @BuiltValueEnumConst(wireName: r'OFFICE')
  static const StopPointProposalResponseDtoOutputTypeEnum OFFICE = _$stopPointProposalResponseDtoOutputTypeEnum_OFFICE;
  @BuiltValueEnumConst(wireName: r'REST_STOP')
  static const StopPointProposalResponseDtoOutputTypeEnum REST_STOP = _$stopPointProposalResponseDtoOutputTypeEnum_REST_STOP;
  @BuiltValueEnumConst(wireName: r'PICKUP_POINT')
  static const StopPointProposalResponseDtoOutputTypeEnum PICKUP_POINT = _$stopPointProposalResponseDtoOutputTypeEnum_PICKUP_POINT;

  static Serializer<StopPointProposalResponseDtoOutputTypeEnum> get serializer => _$stopPointProposalResponseDtoOutputTypeEnumSerializer;

  const StopPointProposalResponseDtoOutputTypeEnum._(String name): super(name);

  static BuiltSet<StopPointProposalResponseDtoOutputTypeEnum> get values => _$stopPointProposalResponseDtoOutputTypeEnumValues;
  static StopPointProposalResponseDtoOutputTypeEnum valueOf(String name) => _$stopPointProposalResponseDtoOutputTypeEnumValueOf(name);
}

class StopPointProposalResponseDtoOutputStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const StopPointProposalResponseDtoOutputStatusEnum PENDING = _$stopPointProposalResponseDtoOutputStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const StopPointProposalResponseDtoOutputStatusEnum APPROVED = _$stopPointProposalResponseDtoOutputStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const StopPointProposalResponseDtoOutputStatusEnum REJECTED = _$stopPointProposalResponseDtoOutputStatusEnum_REJECTED;

  static Serializer<StopPointProposalResponseDtoOutputStatusEnum> get serializer => _$stopPointProposalResponseDtoOutputStatusEnumSerializer;

  const StopPointProposalResponseDtoOutputStatusEnum._(String name): super(name);

  static BuiltSet<StopPointProposalResponseDtoOutputStatusEnum> get values => _$stopPointProposalResponseDtoOutputStatusEnumValues;
  static StopPointProposalResponseDtoOutputStatusEnum valueOf(String name) => _$stopPointProposalResponseDtoOutputStatusEnumValueOf(name);
}

