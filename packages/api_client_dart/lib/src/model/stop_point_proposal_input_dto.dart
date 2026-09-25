//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'stop_point_proposal_input_dto.g.dart';

/// StopPointProposalInputDto
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
@BuiltValue()
abstract class StopPointProposalInputDto implements Built<StopPointProposalInputDto, StopPointProposalInputDtoBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'type')
  StopPointProposalInputDtoTypeEnum get type;
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

  StopPointProposalInputDto._();

  factory StopPointProposalInputDto([void updates(StopPointProposalInputDtoBuilder b)]) = _$StopPointProposalInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StopPointProposalInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StopPointProposalInputDto> get serializer => _$StopPointProposalInputDtoSerializer();
}

class _$StopPointProposalInputDtoSerializer implements PrimitiveSerializer<StopPointProposalInputDto> {
  @override
  final Iterable<Type> types = const [StopPointProposalInputDto, _$StopPointProposalInputDto];

  @override
  final String wireName = r'StopPointProposalInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StopPointProposalInputDto object, {
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
      specifiedType: const FullType(StopPointProposalInputDtoTypeEnum),
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
  }

  @override
  Object serialize(
    Serializers serializers,
    StopPointProposalInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StopPointProposalInputDtoBuilder result,
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
            specifiedType: const FullType(StopPointProposalInputDtoTypeEnum),
          ) as StopPointProposalInputDtoTypeEnum;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  StopPointProposalInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StopPointProposalInputDtoBuilder();
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


class StopPointProposalInputDtoTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BUS_STATION')
  static const StopPointProposalInputDtoTypeEnum BUS_STATION = _$stopPointProposalInputDtoTypeEnum_BUS_STATION;
  @BuiltValueEnumConst(wireName: r'OFFICE')
  static const StopPointProposalInputDtoTypeEnum OFFICE = _$stopPointProposalInputDtoTypeEnum_OFFICE;
  @BuiltValueEnumConst(wireName: r'REST_STOP')
  static const StopPointProposalInputDtoTypeEnum REST_STOP = _$stopPointProposalInputDtoTypeEnum_REST_STOP;
  @BuiltValueEnumConst(wireName: r'PICKUP_POINT')
  static const StopPointProposalInputDtoTypeEnum PICKUP_POINT = _$stopPointProposalInputDtoTypeEnum_PICKUP_POINT;

  static Serializer<StopPointProposalInputDtoTypeEnum> get serializer => _$stopPointProposalInputDtoTypeEnumSerializer;

  const StopPointProposalInputDtoTypeEnum._(String name): super(name);

  static BuiltSet<StopPointProposalInputDtoTypeEnum> get values => _$stopPointProposalInputDtoTypeEnumValues;
  static StopPointProposalInputDtoTypeEnum valueOf(String name) => _$stopPointProposalInputDtoTypeEnumValueOf(name);
}

